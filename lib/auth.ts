import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
        }
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user, account }) {
      // Only handle OAuth providers (not credentials)
      if (account?.provider === "google" || account?.provider === "github") {
        if (!user.email) return false

        try {
          // Check if user already exists in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          if (!existingUser) {
            // Generate username from email or profile name
            let username = user.email.split('@')[0]

            // Check if username already exists and append number if needed
            let usernameExists = await prisma.user.findUnique({
              where: { username }
            })

            let counter = 1
            while (usernameExists) {
              username = `${user.email.split('@')[0]}${counter}`
              usernameExists = await prisma.user.findUnique({
                where: { username }
              })
              counter++
            }

            // Create new user in database
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                username,
                password: null, // OAuth users don't need passwords
                avatar: user.image || null,
              }
            })

            // Update user.id to match the database ID
            user.id = newUser.id
          } else {
            // Update user.id to match the database ID
            user.id = existingUser.id
          }
        } catch (error) {
          console.error("Error creating OAuth user:", error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})

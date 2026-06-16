import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const USERS = [
  { id: '1', email: 'titular@nippon.com', password: 'yamaha2026', name: 'João Paulo Zorzi', role: 'TITULAR' },
  { id: '2', email: 'gerente@nippon.com', password: 'yamaha2026', name: 'Gerente Nippon', role: 'GERENTE' },
  { id: '3', email: 'mecanico@nippon.com', password: 'yamaha2026', name: 'Mecânico Nippon', role: 'MECANICO' },
]

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = USERS.find(
          u => u.email === credentials.email && u.password === credentials.password
        )
        if (!user) return null
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role ?? ''
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
}

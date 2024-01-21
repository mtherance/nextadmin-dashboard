import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./authconfig";
import axios from "axios";
import bcrypt from "bcrypt";

const API_BASE_URL = "http://localhost:3001"; // Replace with your JSON server's URL

const login = async (credentials) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`, {
      params: { username: credentials.username },
    });

    const user = response.data[0]; // Assuming the response is an array, adjust accordingly

    if (!user || !user.isAdmin) throw new Error("Wrong credentials!");

    const isPasswordCorrect = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isPasswordCorrect) throw new Error("Wrong credentials!");

    return user;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to login!");
  }
};

export const { signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          const user = await login(credentials);
          return user;
        } catch (err) {
          return null;
        }
      },
    }),
  ],
  // ADD ADDITIONAL INFORMATION TO SESSION
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.img = user.img;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.username = token.username;
        session.user.img = token.img;
      }
      return session;
    },
  },
});


// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { authConfig } from "./authconfig";
// import { connectToDB } from "./lib/utils";
// import { User } from "./lib/models";
// import bcrypt from "bcrypt";

// const login = async (credentials) => {
//   try {
//     connectToDB();
//     const user = await User.findOne({ username: credentials.username });

//     if (!user || !user.isAdmin) throw new Error("Wrong credentials!");

//     const isPasswordCorrect = await bcrypt.compare(
//       credentials.password,
//       user.password
//     );

//     if (!isPasswordCorrect) throw new Error("Wrong credentials!");

//     return user;
//   } catch (err) {
//     console.log(err);
//     throw new Error("Failed to login!");
//   }
// };

// export const { signIn, signOut, auth } = NextAuth({
//   ...authConfig,
//   providers: [
//     CredentialsProvider({
//       async authorize(credentials) {
//         try {
//           const user = await login(credentials);
//           return user;
//         } catch (err) {
//           return null;
//         }
//       },
//     }),
//   ],
//   // ADD ADDITIONAL INFORMATION TO SESSION
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.username = user.username;
//         token.img = user.img;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.username = token.username;
//         session.user.img = token.img;
//       }
//       return session;
//     },
//   },
// });

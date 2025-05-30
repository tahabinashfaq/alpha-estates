"use client";
import { ReactNode } from "react";
import { AuthProvider } from "../app/context/AuthContext";
import { BookmarkProvider } from "../app/context/BookmarkContext";
import { ComparisonProvider } from "../app/context/ComparisonContext";
import { ComparisonBar } from "./ComparisonBar";

interface ClientLayoutProps {
  children: ReactNode;
}

export const ClientLayout = ({ children }: ClientLayoutProps) => {
  return (
    <AuthProvider>
      <BookmarkProvider>
        <ComparisonProvider>
          {children}
          <ComparisonBar />
        </ComparisonProvider>
      </BookmarkProvider>
    </AuthProvider>
  );
};

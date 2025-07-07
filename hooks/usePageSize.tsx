import { createContext, useContext, useState, ReactNode } from "react";

interface PageSizeContextType {
  pageSize: number | string;
  setPageSize: (size: number | string) => void;
}

const PageSizeContext = createContext<PageSizeContextType | undefined>(undefined);

export function PageSizeProvider({ children }: { children: ReactNode }) {
  const [pageSize, setPageSize] = useState<number | string>(10);
  return (
    <PageSizeContext.Provider value={{ pageSize, setPageSize }}>
      {children}
    </PageSizeContext.Provider>
  );
}

export function usePageSize() {
  const context = useContext(PageSizeContext);
  if (!context) throw new Error("usePageSize must be used within a PageSizeProvider");
  return context;
} 
import React, { createContext, useContext } from "react";
import { toast } from "sonner";

interface DemoCtx {
  isDemo: boolean;
  blockWrite: (action?: string) => boolean;
}

const Ctx = createContext<DemoCtx>({ isDemo: false, blockWrite: () => false });

export const DemoProvider: React.FC<{ isDemo: boolean; children: React.ReactNode }> = ({
  isDemo,
  children,
}) => {
  const blockWrite = (_action?: string) => {
    if (isDemo) {
      toast("Modo demonstração, ação desativada", {
        description: "Crie uma conta para liberar essa funcionalidade.",
      });
      return true;
    }
    return false;
  };
  return <Ctx.Provider value={{ isDemo, blockWrite }}>{children}</Ctx.Provider>;
};

export const useDemo = () => useContext(Ctx);

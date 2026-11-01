import { useEffect, useState } from "react";
import { getWallet, Wallet } from "../service/wallet";

/** Current wallet, refreshed whenever coins or powers change. */
const useWallet = (): Wallet => {
  const [wallet, setWallet] = useState(getWallet);
  useEffect(() => {
    const update = () => setWallet(getWallet());
    window.addEventListener("maze:wallet", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("maze:wallet", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return wallet;
};

export default useWallet;

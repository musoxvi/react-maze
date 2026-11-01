import { FC, useState } from "react";
import Modal from "../../components/Modal/Modal";
import { Button } from "../../components/ui/styles";
import { POWERS } from "../../constants/powers";
import useWallet from "../../hooks/useWallet";
import { buyPower } from "../../service/wallet";
import { ShopList, ShopItem, Empty } from "./styles";

type Props = { onClose: () => void };

const Shop: FC<Props> = ({ onClose }) => {
  const wallet = useWallet();
  const [bought, setBought] = useState<string | null>(null);

  return (
    <Modal title={`Shop · ${wallet.coins} 🪙`} onClose={onClose}>
      <ShopList>
        {POWERS.map((power) => {
          const owned = wallet.inventory[power.id] ?? 0;
          const affordable = wallet.coins >= power.price;
          return (
            <ShopItem key={power.id}>
              <span className="icon" aria-hidden="true">
                {power.icon}
              </span>
              <div className="info">
                <strong>
                  {power.name} <kbd>{power.key}</kbd>
                </strong>
                <span>{power.description}</span>
                <span className="owned">Owned: {owned}</span>
              </div>
              <Button
                type="button"
                disabled={!affordable}
                onClick={() => {
                  if (buyPower(power.id, power.price)) setBought(power.name);
                }}
              >
                {power.price} 🪙
              </Button>
            </ShopItem>
          );
        })}
      </ShopList>
      <Empty as="p" style={{ margin: "12px 0 0", fontSize: 13 }}>
        {bought
          ? `${bought} added. Use it in a game with its number key.`
          : "Earn coins by finishing levels. Harder levels, high scores and first clears pay more."}
      </Empty>
    </Modal>
  );
};

export default Shop;

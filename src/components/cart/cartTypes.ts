/** 장바구니 1줄 — 육아용품 Product와 동기화 */
export type CartLine = {
  productId: number;
  name: string;
  imageUrl: string;
  /** 표시용 "32,000" */
  priceLabel: string;
  unitWon: number;
  quantity: number;
  selected: boolean;
};

export type CartProductInput = {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
};

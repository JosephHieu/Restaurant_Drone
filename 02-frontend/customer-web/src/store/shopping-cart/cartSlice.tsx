import { createSlice } from "@reduxjs/toolkit";

interface ExtraIngredient {
  id: string;
  name: string;
  price: number;
}

interface CartItem {
  id: string;
  title: string;
  image01: string;
  price: number;
  quantity: number;
  totalPrice: number;
  extraIngredients: ExtraIngredient[];
}

const items: CartItem[] =
  localStorage.getItem("cartItems") !== null
    ? JSON.parse(localStorage.getItem("cartItems") as string)
    : [];

const totalAmount: number =
  localStorage.getItem("totalAmount") !== null
    ? JSON.parse(localStorage.getItem("totalAmount") as string)
    : 0;

const totalQuantity: number =
  localStorage.getItem("totalQuantity") !== null
    ? JSON.parse(localStorage.getItem("totalQuantity") as string)
    : 0;

const setItemFunc = (item: CartItem[], totalAmount: number, totalQuantity: number): void => {
  localStorage.setItem("cartItems", JSON.stringify(item));
  localStorage.setItem("totalAmount", JSON.stringify(totalAmount));
  localStorage.setItem("totalQuantity", JSON.stringify(totalQuantity));
};

const initialState = {
  cartItems: items,
  totalQuantity: totalQuantity,
  totalAmount: totalAmount,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    // =========== add item ============
    addItem(state, action) {
      const newItem: CartItem = action.payload;
      const id = action.payload.id;
      const extraIngredients = action.payload.extraIngredients;
      const existingItem = state.cartItems.find((item) => item.id === id);

      if (!existingItem) {
        state.cartItems.push({
          id: newItem.id,
          title: newItem.title,
          image01: newItem.image01,
          price: newItem.price,
          quantity: 1,
          totalPrice: newItem.price,
          extraIngredients: newItem.extraIngredients
        });
        state.totalQuantity++;
      } else if (existingItem && (JSON.stringify(existingItem.extraIngredients) === JSON.stringify(extraIngredients))) {
        state.totalQuantity++;
        existingItem.quantity++;
        existingItem.totalPrice += Number(existingItem.price);
      } else {
        // eslint-disable-next-line prefer-const
        let index = state.cartItems.findIndex(item => item.id === existingItem.id);
        const newValue: CartItem = {
          id: existingItem.id,
          title: existingItem.title,
          image01: existingItem.image01,
          price: existingItem.price,
          quantity: 1,
          totalPrice: existingItem.price,
          extraIngredients: extraIngredients
        };
        state.cartItems.splice(index, 1, newValue);
        state.totalQuantity = state.cartItems.reduce(
          (total, item) => total + Number(item.quantity),
          0
        );
      }

      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + Number(item.price) * Number(item.quantity),
        0
      );

      setItemFunc(
        state.cartItems,
        state.totalAmount,
        state.totalQuantity
      );
    },

    // ========= remove item ========
    removeItem(state, action) {
      const id: string = action.payload;
      const existingItem = state.cartItems.find((item) => item.id === id);
      if (!existingItem) return;

      state.totalQuantity--;

      if (existingItem.quantity === 1) {
        state.cartItems = state.cartItems.filter((item) => item.id !== id);
      } else {
        existingItem.quantity--;
        existingItem.totalPrice -= Number(existingItem.price);
      }

      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + Number(item.price) * Number(item.quantity),
        0
      );

      setItemFunc(
        state.cartItems,
        state.totalAmount,
        state.totalQuantity
      );
    },

    //============ delete item ===========
    deleteItem(state, action) {
      const id: string = action.payload;
      const existingItem = state.cartItems.find((item) => item.id === id);

      if (existingItem) {
        state.cartItems = state.cartItems.filter((item) => item.id !== id);
        state.totalQuantity = state.totalQuantity - existingItem.quantity;
      }

      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + Number(item.price) * Number(item.quantity),
        0
      );
      setItemFunc(
        state.cartItems,
        state.totalAmount,
        state.totalQuantity
      );
    },
  },
});

export const cartActions = cartSlice.actions;
export default cartSlice;
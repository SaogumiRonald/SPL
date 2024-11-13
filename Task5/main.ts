
type BaseProduct = {
  id: number;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
};

type Electronics = BaseProduct & {
  category: 'electronics';
  warrantyPeriod: number;
  brand: string;
};

type Beauty = BaseProduct & {
  category: 'beauty';
  size: 'trial' | 'travel' | 'normal';
  color: string;
};

type CartItem<T> = {
  product: T;
  quantity: number;
};

const findProduct = <T extends BaseProduct>(products: T[], id: number): T | undefined => {
  return products.find(product => product.id === id);
};

const filterByPrice = <T extends BaseProduct>(products: T[], maxPrice: number): T[] => {
  return products.filter(product => product.price <= maxPrice);
};


const addToCart = <T extends BaseProduct>(cart: CartItem<T>[], product: T, quantity: number): CartItem<T>[] => {
  const existingItem = cart.find(item => item.product.id === product.id);
  if (existingItem) {
      existingItem.quantity += quantity;
  } else {
      cart.push({ product, quantity });
  }
  return cart;
};

const calculateTotal = <T extends BaseProduct>(cart: CartItem<T>[]): number => {
  return cart.reduce((total: number, item: CartItem<T>) => total + item.product.price * item.quantity, 0);
};



//Demonstration
const electronics: Electronics[] = [
  {
      id: 1,
      name: "iPhone",
      price: 999,
      description: "iPhone 16",
      inStock: true,
      category: 'electronics',
      warrantyPeriod: 24,
      brand: "Apple"
  },
  {
      id: 2,
      name: "iPad 10.9",
      price: 459,
      description: "Tablet Apple iPad 10.9 2024 Wi-Fi 64GB",
      inStock: false,
      category: 'electronics',
      warrantyPeriod: 24,
      brand: "Apple"
  }
];

const beauty: Beauty[] = [
  {
      id: 3,
      name: "blush",
      price: 270,
      description: "pigmented burgundy blush",
      inStock: true,
      category: 'beauty',
      size: 'travel',
      color: ""
  },
  {
      id: 4,
      name: "lipstick",
      price: 380,
      description: "The legendary shade of Dior lipstick 999",
      inStock: true,
      category: 'beauty',
      size: 'travel',
      color: "999"
  }
];

const phone = findProduct(electronics, 1);
console.log("Founded:", phone);

const filteredProducts = filterByPrice([...electronics, ...beauty], 400);
console.log("Goods with a cost less than 400:", filteredProducts);

let cart: CartItem<BaseProduct>[] = [];
if (phone) {
  cart = addToCart(cart, phone, 2);
}
console.log("Shoping cart:", cart);

if (beauty[0]) {
  cart = addToCart(cart, beauty[0], 2);
}
console.log("Shoping cart:", cart);

const total = calculateTotal(cart);
console.log("Total shoping cart sum:", total);
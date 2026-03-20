// Products are stored as objects that have the following properties:

// id — unique identifier (string, uuid) generated on the server side
// name — product name (string, required)
// description — product description (string, required)
// price — product price (number, required, must be > 0)
// category — product category (string, required, e.g. "electronics", "books", "clothing")
// inStock — whether the product is in stock (boolean, required)

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
}

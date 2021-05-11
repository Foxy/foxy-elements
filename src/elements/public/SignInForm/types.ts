export type Data = {
  _links: { self: { href: string } };
  type: 'password';
  credential: {
    email: string;
    password: string;
  };
};

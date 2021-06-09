import { TemplateResult, html } from 'lit-html';

const getHref = (page: string) => {
  return `/iframe.html?id=other-customerportal--adding-pages-guide-${page}-demo&viewMode=story`;
};

export const AddingPagesGuideOrdersDemo = (): TemplateResult => html`
  <foxy-customer-portal
    base="https://demo.foxycart.com/s/customer/"
    hiddencontrols="customer:header:actions:edit customer:subscriptions customer:transactions customer:addresses customer:payment-methods"
  >
    <template slot="customer:header:before">
      <style>
        a {
          color: var(--lumo-primary-color);
          margin-right: var(--lumo-space-m);
          text-decoration: none;
          font-weight: 500;
        }

        a:hover {
          text-decoration: underline;
        }
      </style>

      <nav>
        <a href=${getHref('profile')}>My Profile</a>
        <a href=${getHref('orders')}>My Orders</a>
        <a href="mailto:hello@foxy.io">Contact Us</a>
      </nav>
    </template>

    <template slot="customer:default">
      <p>Hello from the orders page!</p>
    </template>
  </foxy-customer-portal>
`;

import { TemplateResult, html } from 'lit-html';

const getHref = (page: string) => {
  return `/iframe.html?id=other-customerportal--adding-pages-guide-${page}-demo&viewMode=story`;
};

export const AddingPagesGuideProfileDemo = (): TemplateResult => html`
  <foxy-customer-portal base="https://demo.api/portal/">
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
  </foxy-customer-portal>
`;

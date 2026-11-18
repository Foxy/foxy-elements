import { afterEach, describe, expect, it } from "vitest";
import { focusIndex, focusPage } from "./page-focus";

function mountPortal(html: string) {
  const host = document.createElement("div");
  document.body.append(host);
  const container = document.createElement("div");
  host.attachShadow({ mode: "open" }).append(container);
  container.innerHTML = html;
  return { host, container, root: host.shadowRoot! };
}

const nextFrame = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  document.body.replaceChildren();
});

describe("focusIndex", () => {
  it("counts only tabbable controls, so it survives a re-render", () => {
    const { container, root } = mountPortal(
      "<h1>Name</h1><button>One</button><button disabled>Off</button><button>Two</button>",
    );
    (root.querySelectorAll("button")[2] as HTMLElement).focus();
    expect(focusIndex(container)).toBe(1);
  });

  it("is null when focus is outside the portal", () => {
    const { container } = mountPortal("<button>One</button>");
    expect(focusIndex(container)).toBeNull();
  });
});

describe("focusPage", () => {
  it("focuses the page heading and keeps it out of the Tab order", () => {
    const { container, root } = mountPortal(
      "<h1>Edit Profile</h1><button>Save</button>",
    );
    focusPage(container, null);
    expect(root.activeElement?.textContent).toBe("Edit Profile");
    expect(root.activeElement?.getAttribute("tabindex")).toBe("-1");
  });

  it("focuses the control a Back returns to", () => {
    const { container, root } = mountPortal(
      "<h1>Home</h1><button>Edit Profile</button><button>Manage</button>",
    );
    focusPage(container, 1);
    expect(root.activeElement?.textContent).toBe("Manage");
  });

  it("waits for a page that renders its heading after loading", async () => {
    const { container, root } = mountPortal("<button>Back</button>");
    focusPage(container, null);
    expect(root.activeElement).toBeNull();

    container.insertAdjacentHTML("beforeend", "<h1>Order #2047</h1>");
    await nextFrame();
    expect(root.activeElement?.textContent).toBe("Order #2047");
  });

  it("falls back to the heading when the control never comes back", async () => {
    const { container, root } = mountPortal(
      "<h1>Home</h1><button>Edit Profile</button>",
    );
    focusPage(container, 4, 10);
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(root.activeElement?.textContent).toBe("Home");
  });

  it("leaves focus alone when it is elsewhere on the host page", () => {
    const outside = document.createElement("input");
    document.body.append(outside);
    outside.focus();
    const { container } = mountPortal("<h1>Home</h1>");

    focusPage(container, null);
    expect(document.activeElement).toBe(outside);
  });

  it("stops waiting once cancelled", async () => {
    const { container, root } = mountPortal("<button>Back</button>");
    const stop = focusPage(container, null);
    stop();

    container.insertAdjacentHTML("beforeend", "<h1>Too late</h1>");
    await nextFrame();
    expect(root.activeElement).toBeNull();
  });
});

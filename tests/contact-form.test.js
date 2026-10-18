import { test, before } from "node:test";
import assert from "node:assert/strict";
import Eleventy from "@11ty/eleventy";

// Netlify detects forms by parsing the deployed HTML, so these tests check
// the built output rather than the template source.

let pages;

before(async () => {
  const elev = new Eleventy(".", "_site", { quietMode: true, configPath: "eleventy.config.js" });
  const results = await elev.toJSON();
  pages = new Map(results.map((r) => [r.url, r.content]));
});

const contactForm = () => {
  const html = pages.get("/contact/");
  assert.ok(html, "expected a page at /contact/");
  const match = html.match(/<form[^>]*name="contact"[\s\S]*?<\/form>/);
  assert.ok(match, "expected a form named contact");
  return match[0];
};

test("contact form is registered with Netlify", () => {
  const form = contactForm();
  assert.match(form, /data-netlify="true"/);
  assert.match(form, /method="POST"/i);
});

test("contact form posts its name so Netlify can match submissions", () => {
  assert.match(contactForm(), /<input type="hidden" name="form-name" value="contact"/);
});

test("contact form has a honeypot field hidden from people", () => {
  const form = contactForm();
  assert.match(form, /netlify-honeypot="bot-field"/);
  assert.match(form, /name="bot-field"/);
});

test("name, email, and message are required and labelled", () => {
  const form = contactForm();
  for (const field of ["name", "email", "message"]) {
    assert.match(form, new RegExp(`<label for="contact-${field}"`), `${field} needs a label`);
    assert.match(form, new RegExp(`id="contact-${field}"[^>]*required`), `${field} should be required`);
  }
  assert.match(form, /type="email"/);
});

test("successful submissions land on a thank-you page that exists", () => {
  const action = contactForm().match(/action="([^"]+)"/)?.[1];
  assert.equal(action, "/contact/thanks/");
  assert.ok(pages.get(action), "thank-you page should be built");
});

test("about page links to the contact page", () => {
  assert.match(pages.get("/about/"), /href="\/contact\/"/);
});

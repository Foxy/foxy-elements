# A ready to use donation form

Donation Form is a customizable web component that provides a form to accept donations.

In it's most basic implementation it simply accepts a donation of a given value, but it can be expanded to include custom donation values, recurring donations, designation choices, comments and anonymous donations.

You'll need your Foxy Store Subdomain to accept donations. Other than that you can customize your form however you want.

## Quick examples

You only need your Foxy Store Subdomain to start accepting donations.

The simplest use case for this donation form is this:

```html
<foxy-donation storeSubdomain="MyStore" value="123"></foxy-donation>
```

By setting the value for the donation and the Foxy Store Subdomain, your donation form is ready.

The form is way more powerful than that: you can display a list of possible values for the donners to choose from, allow them to leave a message and even to commit themselves to recursive payments. All with incredible ease:

```html
<foxy-donation
    storeSubdomain="MyStore"
    valueOptions="[10, 20, 30]"
    askComment
    askRecurrence
    >
</foxy-donation>
```
# Configuration

### The form parts

The Donation form is composed of 5 parts plus a donation button. All parts are optional, except for the donation button. The parts are:

1. A donation value (value)
1. A recurrence (recurrence)
1. A comment (comment)
1. An anonymous (anonymous)
1. A designation (designation)

Each of these parts can be customized and they may include several fields to achieve their purpose.

The parts displayed in the order above by default, but you can customize that by setting a weight to the parts.  The "heavier" the part, the lower it will appear in the form. Using `commentWeight=10`, for example, you can make the comment field be the last in the form, while by using `commentWeight=-1` you can make it be the first.

[Check the Form Parts section](#form-parts) to lear how to use and customize
each form part.

## The cart attribute options

There are some attribute options you can use that will affect how the product will be displayed in your cart.

- name: the name of the this particular product or donation campaign
- code: a unique identifier of this product or donation campaign
- image: a url of an image to be displayed beside the product or donation campaign in the cart
- url: a url of the product or donaiton campaign

Please note: the currency used is the store's currency.

## Configuration Summary

This summary is meant to be used as a reference.

### Attributes

| Attribute   | Default Value | Description |
| ----------- | ----------- |-------------|
|storeSubdomain | - | Your Foxy Store Subdomain| 
|name | 'FOXYDONATIONFORM'|The product name. This should be a name your user will clearly identify in the cart.|
|code | '' | A unique identification of this particular product. This should be a name you'll clearly identify as related to the particular donation campaing you are handling|
|image | ''| An image to be displayed in the cart. Please note that this image is not rendered in the form. If you want to render images in the form, use the slots as described in the slots table.|
|url | ''| A URL to the donation campaign. It will be displayed in the cart, so that the user can visit the donation campaign from there.|
|**value** | '100'| The default value of the donation. The donation button will initially have this value. User can change it using the donation options provided.|
|valueWeight | 1| The position the value field should have in the form|
|valueType | 'radio'|The widget to be used for the value selection. It can be **radio** or **select**|
|valueOptions| [] | The value options the user will be provided in this donation campaign. If left empty no widget for value selection will be displayed|
|valueLabel | 'Select the value'| The label used in the donation value widget|
|askValueOther | false | Whether to provide an option to give a custom amount. If this option is set, there will be an option called "other". If the user choose this option a text field is shown to receive the custom amount.|
|**askRecurrence** | false| Whether the user should be provided with a field to subscribe to a recurring donation.|
|recurrenceWeight | 2 | The position the designation field should have in the form.|
|recurrenceLabel | this.vocabulary.defaultRecurrenceLabel | The label to be displayed in the recurrence widget.|
|**askComment** | false| Whether to provided an option to leave a comment.|
|commentWeight | 3 | The position the comment field should have in the form.|
|commentLabel | this.vocabulary.defaultCommentLabel| The label to be provided in the comment widget.|
|commentPlaceholder | this.vocabulary.defaultCommentPlaceholder| A placeholder to be included in the comment widget.|
|**askAnonymous** | false| Whether the user should be provided with a field to request to be anonymous. This option does not add security features, it simply informs that the donnor does not wish to be recognized as such.|
|anonymousWeight | 4|  The position the designation field should have in the form.|
|**designationOptions** | [] | Designations the user will be able to choose from. These are text values and the user may choose more than one, if available.|
|askDesignationOther | false | Whether to provide an "other" option in the designation widget.|
|designationType | 'checkbox'| The widget to be used for the designation options.|
|designationWeight | 5 | The position the designation form will have in the form.|
|designationLabel | this.vocabulary.defaultDesignationLabel| The label to displayed in the designation widget.|
|submitButtonIcon | true | Whether the default icon should be used in the button. If you want to use a different icon, simply use the submit slot and set submitButtonIcon to false|
|submitButtonText | this.vocabulary.defaultSubmitButtonText| The text to be displayed in the button.|

### The slots

Web components allow you to include your own markup in special places called slots. Donation form has two slots for each part. 

You can use any tags you want in these slots, including images.

| Slot | Description|
| ----------- | ----------- |
| value | content to be displayed related to the choose value input field |
| after-value | content to be displayed after the value widget |
| recurrence | content to be displayed related to the recurrence input field |
| after-recurrence | content to be displayed after the recurrence widget |
| anonymous | content to be displayed related to the anonymous field |
| after-anonymous | content to be displayed after the anonymous widget |
| designation | content to be displayed related to the designation field |
| after-designation | content to be displayed after the designation widget |
| comment | content to be displayed related to the comment field |
| after-comment | content to be displayed after the comment widget |
| submit | content to be displayed related to the submit field |

The submit slot replaces both the Icon and Text in the submit button. You can use a custom button by adding an image to this slot. 


## Examples

You can see these examples live in the `dev` folder of the project.  [Run a dev server](#dev-server) and navigate to `http://localhost:8080/src/elements/public/DonationForm/demo/index.html`.


### The simplest form: a button

```html
<donation-form storeSubdomain="jamstackecommerceexample.foxycart.com" value="100"></donation-form>
```


### Offer some choices of values

You can offer some value choices by simply adding the "valueOptions" attribute.

```html
<donation-form storeSubdomain="jamstackecommerceexample.foxycart.com" valueOptions="[10, 30, 50, 100]"></donation-form>
```

### Allow for a recurrent contribution
Allow people to commit to a recurrent contribution.
Also, notice you can use the name, image and url attributes to customize how the donation will be shown in the cart.

```html
<donation-form
  storeSubdomain="jamstackecommerceexample.foxycart.com"
  name="I'll be a part of this"
  image="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Children_holding_hands_together.png/320px-Children_holding_hands_together.png"
  askRecurrence
  valueOptions="[10, 30, 50, 100]">
</donation-form>
<hr>
```

### Allow the donner to set a custom ammount
You can use the "askValueOther" attribute to add a "other" field

```html
<donation-form storeSubdomain="jamstackecommerceexample.foxycart.com"
     valueOptions="[10, 30, 50, 100]"
     askValueOther
     ></donation-form>
```

### Allow the user to choose a designation for the donation

You can use the "designationOptions" to allow for specifying a designation.

```html
<donation-form storeSubdomain="jamstackecommerceexample.foxycart.com"
     valueOptions="[10, 30, 50, 100]"
     designationOptions='["Rebuild the School", "Medical Assistance", "Psicological Assistance", "Daily Meals"]'
     askValueOther="true"
     askDesignationOther="true"
     ></donation-form>
```

### Change order and type
You can change the field type used. Instead of using radio buttons or check boxes, you may prefer to use select boxes instead.
You can also change the order of any part of the form.  To do that, add a "Weight" suffix to the name of the part of the form you want to set a weight to to compose an attribute. The greater the weight the further down that part will be placed.
Notice in the previous example that designation after the value by default. To invert that do the following:

```html
<donation-form storeSubdomain="jamstackecommerceexample.foxycart.com"
   valueOptions="[10, 30, 50, 100]"
   designationOptions='["Rebuild the School", "Medical Assistance", "Psicological Assistance", "Daily Meals"]'
   askValueOther="true"
   askDesignationOther="true"
   valueType="select"
   designationType="select"
   designationWeight="1"
   valueWeight="2"
   ></donation-form>
```

### Include comment and anonymous donation button
On top of all that you may allow the donner to ask to remain anonymous and to leave a comment.
Please notice that the "anonymous" options only means that the donner does not wish to be publicly recognized.

```html
<donation-form
  askComment
  askAnonymous
  valueOptions="[20, 100, 250]" >
</donation-form>
```

### Include your own markup
You can include whatever markup you wish above with your form parts. Simply use the name of that specific part as the slot where to place it.

```html
<donation-form valueOptions="[1, 2, 3]"
  askValueOther
  askComment
  askAnonymous
  askDesignation
  commentWeight="8"
  anonymousWeight="0"
  valueWeight="8"
  valueType="select"
  >
  <p slot="value">
    You have a crucial role in our mission. None of this could have been
    done without your generous donation.
    <img style="float:right" src="/dev/img/tree.jpg" alt="A nice tree icon.">
  </p>
  <strong slot="anonymous">Would you like to remain anonymous?</strong>
  <p slot="comment">Would you like to leave us a message?</p>
</donation-form>
```

### Add your own markup after any form part
If you want to add a markup after any given part, you can use the "after-part" slot names, where part stands for the part's name.

```html
      <p>Here's the result:</p>
      <donation-form askValueOther askComment askAnonymous askDesignation >
        <div slot="after-comment">After Comment</div>
        <div slot="after-anonymous">After Anonymous</div>
      </donation-form>
```

# Installation

You may simply download and extract the package to your server. If you extracted it as a folder named `foxy-elements`, you can import the component adding the following script to you HTML head tag.

```html
    <script type="module">
      import { DonationForm } from '/foxy-elements/index.js';
      window.customElements.define('donation-form', DonationForm);
    </script>
```

You may install it using npm:

```bash
npm install @foxy.io/elements
```

# Development

## Setup

Install dependencies:

```bash
npm i
```

## Build

This sample uses the TypeScript compiler to produce JavaScript that runs in modern browsers.

To build the JavaScript version of your component:

```bash
npm run build
```

## Dev Server

To run the dev server and open the project in a new browser tab:

```bash
npm run start
```

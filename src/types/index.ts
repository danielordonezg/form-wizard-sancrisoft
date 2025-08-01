export type SubmitState = "idle" | "success" | "error";

export type BusinessData = {
  businessName: string;
  businessType: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
};

export type ContactData = {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
};

export type WizardData = {
  business: BusinessData;
  contact: ContactData;
};

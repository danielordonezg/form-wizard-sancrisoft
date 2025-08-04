import { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Layout, Left, Right } from "../components/Layout";
import { Stepper } from "../components/Stepper";
import {
  Actions,
  EditLink,
  Fieldset,
  Form,
  Help,
  Input,
  KV,
  Label,
  Legend,
  Muted,
  Primary,
  Row,
  Section,
  SectionHeader,
  SectionTitle,
  Select,
} from "../components/Fields";
import { businessSchema, contactSchema } from "../lib/validation";
import { usePersistentState } from "../hooks/usePersistentState";
import { BusinessData, ContactData, SubmitState, WizardData } from "../types";
import { COMPANY_TYPES, COUNTRIES, US_STATES } from "@/constants/options";
import { useMediaQuery } from "@/utils/useMediaQuery";

const Grid = styled.div`
  display: contents;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }
`;

const PhoneRow = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 12px;
  align-items: center;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const CountryWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AddressReview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const initialData: WizardData = {
  business: {
    businessName: "",
    businessType: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
  },
  contact: {
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "0",
    phone: "",
  },
};

export default function Home() {
  const [data, setData] = usePersistentState<WizardData>(
    "wizard:data",
    initialData
  );
  const [step, setStep] = usePersistentState<number>("wizard:step", 1);
  const [submitState, setSubmitState] = usePersistentState<SubmitState>(
    "wizard:submit",
    "idle"
  );
  const [submitMessage, setSubmitMessage] = usePersistentState<string>(
    "wizard:msg",
    ""
  );
  const [touched, setTouched] = usePersistentState<boolean>("wizard:t", false);
  const [navLocked, setNavLocked] = usePersistentState<boolean>(
    "wizard:lock",
    false
  );
  const [busy, setBusy] = useState(false);

  const statusPill =
    submitState === "success"
      ? "success"
      : submitState === "error"
      ? "error"
      : touched
      ? "inprogress"
      : null;

  const completed = {
    1: businessSchema.safeParse(data.business).success,
    2: contactSchema.safeParse(data.contact).success,
    3: submitState === "success",
  };

  const focusCurrentStepFirstError = () => {
    if (step === 1) {
      const { errors } = validateAndFocus(
        businessSchema,
        data.business,
        bizRefs
      );
      setBizErrors(errors);
    } else if (step === 2) {
      const { errors } = validateAndFocus(contactSchema, data.contact, ctcRefs);
      setCtcErrors(errors);
    }
  };

  const goStep = (i: number) => {
    if (navLocked) return;
    if (i < step) setStep(i);
    if (i > step) {
      if (step === 1 && !completed[1]) {
        focusCurrentStepFirstError();
        return;
      }
      if (step === 2 && !completed[2]) {
        focusCurrentStepFirstError();
        return;
      }
      setStep(i);
    }
  };

  const onChangeBusiness = (patch: Partial<BusinessData>) => {
    if (!touched) setTouched(true);
    setData({ ...data, business: { ...data.business, ...patch } });
  };

  const onChangeContact = (patch: Partial<ContactData>) => {
    if (!touched) setTouched(true);
    setData({ ...data, contact: { ...data.contact, ...patch } });
  };

  const firstErrorRef = useRef<HTMLInputElement | null>(null);

  const validateAndFocus = (
    schema: any,
    values: any,
    refs: Record<string, HTMLInputElement | null>
  ) => {
    const result = schema.safeParse(values);
    if (result.success)
      return { ok: true, errors: {} as Record<string, string> };
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    const firstKey = Object.keys(refs).find((k) => fieldErrors[k]);
    if (firstKey && refs[firstKey]) {
      firstErrorRef.current = refs[firstKey];
      setTimeout(() => refs[firstKey]?.focus(), 0);
    }
    return { ok: false, errors: fieldErrors };
  };

  const [bizErrors, setBizErrors] = useState<Record<string, string>>({});
  const [ctcErrors, setCtcErrors] = useState<Record<string, string>>({});

  const bizRefs: Record<string, HTMLInputElement | null> = {};
  const ctcRefs: Record<string, HTMLInputElement | null> = {};

  const validateField = (schema: any, key: string, value: any) => {
    const sub = schema.pick({ [key]: true });
    const r = sub.safeParse({ [key]: value });
    return r.success ? "" : r.error.issues[0]?.message || "Invalid value";
  };

  const submit = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          business: data.business,
          contact: data.contact,
        }),
      });
      const json = await res.json();
      if (res.ok && json?.status === "ok") {
        setSubmitState("success");
        setSubmitMessage(
          json?.message ||
            "Thanks for submitting your company! We’ll be in touch shortly."
        );
        setNavLocked(true);
      } else {
        setSubmitState("error");
        setSubmitMessage(json?.message || "There was an error.");
      }
    } catch {
      setSubmitState("error");
      setSubmitMessage("Network/server error. Please retry.");
    } finally {
      setBusy(false);
    }
  };

  const startOver = () => {
    setData(initialData);
    setStep(1);
    setSubmitState("idle");
    setSubmitMessage("");
    setTouched(false);
    setNavLocked(false);
  };

  const maskPhone = (v: string) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d{3})(\d{0,4}).*/, "($1) $2-$3")
      .trim();

  const isMobile = useMediaQuery("(max-width: 560px)");

  return (
    <Layout statusLabel={statusPill as any}>
      <Grid>
        <Left>
          <Stepper
            current={step}
            completed={completed}
            onNavigate={goStep}
            disabled={navLocked}
            compact={isMobile}
          />
        </Left>

        <Right>
          {step === 1 && (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                const { ok, errors } = validateAndFocus(
                  businessSchema,
                  data.business,
                  bizRefs
                );
                setBizErrors(errors);
                if (ok) setStep(2);
              }}
              aria-labelledby="step1"
            >
              <Fieldset>
                <Label htmlFor="businessName">Business name</Label>
                <Input
                  id="businessName"
                  ref={(el) => (bizRefs.businessName = el)}
                  value={data.business.businessName}
                  onChange={(e) => {
                    onChangeBusiness({ businessName: e.target.value });
                    if (bizErrors.businessName)
                      setBizErrors((s) => ({ ...s, businessName: "" }));
                  }}
                  onBlur={(e) =>
                    setBizErrors((s) => ({
                      ...s,
                      businessName: validateField(
                        businessSchema,
                        "businessName",
                        e.target.value
                      ),
                    }))
                  }
                  placeholder="Registered business name"
                  invalid={!!bizErrors.businessName}
                  aria-invalid={!!bizErrors.businessName}
                  aria-describedby={
                    bizErrors.businessName ? "err-businessName" : undefined
                  }
                />
                {bizErrors.businessName ? (
                  <Help id="err-businessName" tone="error">
                    Enter the registered business name
                  </Help>
                ) : null}
              </Fieldset>

              <Fieldset>
                <Label htmlFor="businessType">Type</Label>
                <Select
                  id="businessType"
                  value={data.business.businessType}
                  onChange={(e) => {
                    onChangeBusiness({ businessType: e.target.value });
                    if (bizErrors.businessType)
                      setBizErrors((s) => ({ ...s, businessType: "" }));
                  }}
                  onBlur={(e) =>
                    setBizErrors((s) => ({
                      ...s,
                      businessType: validateField(
                        businessSchema,
                        "businessType",
                        e.target.value
                      ),
                    }))
                  }
                  invalid={!!bizErrors.businessType}
                  aria-invalid={!!bizErrors.businessType}
                  aria-describedby={
                    bizErrors.businessType ? "err-businessType" : undefined
                  }
                >
                  <option value="" hidden>
                    Type of business
                  </option>
                  {COMPANY_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
                {bizErrors.businessType ? (
                  <Help id="err-businessType" tone="error">
                    Select a type
                  </Help>
                ) : null}
              </Fieldset>

              <Fieldset>
                <Label>Address</Label>
                <Stack>
                  <Input
                    id="address1"
                    placeholder="Address line 1"
                    ref={(el) => (bizRefs.address1 = el)}
                    value={data.business.address1}
                    onChange={(e) => {
                      onChangeBusiness({ address1: e.target.value });
                      if (bizErrors.address1)
                        setBizErrors((s) => ({ ...s, address1: "" }));
                    }}
                    onBlur={(e) =>
                      setBizErrors((s) => ({
                        ...s,
                        address1: validateField(
                          businessSchema,
                          "address1",
                          e.target.value
                        ),
                      }))
                    }
                    invalid={!!bizErrors.address1}
                    aria-invalid={!!bizErrors.address1}
                    aria-describedby={
                      bizErrors.address1 ? "err-address1" : undefined
                    }
                  />
                  {bizErrors.address1 && (
                    <Help id="err-address1" tone="error">
                      Required
                    </Help>
                  )}

                  <Input
                    id="address2"
                    placeholder="Address line 2 (optional)"
                    value={data.business.address2 || ""}
                    onChange={(e) =>
                      onChangeBusiness({ address2: e.target.value })
                    }
                  />

                  <Input
                    id="city"
                    placeholder="City"
                    ref={(el) => (bizRefs.city = el)}
                    value={data.business.city}
                    onChange={(e) => {
                      onChangeBusiness({ city: e.target.value });
                      if (bizErrors.city)
                        setBizErrors((s) => ({ ...s, city: "" }));
                    }}
                    onBlur={(e) =>
                      setBizErrors((s) => ({
                        ...s,
                        city: validateField(
                          businessSchema,
                          "city",
                          e.target.value
                        ),
                      }))
                    }
                    invalid={!!bizErrors.city}
                    aria-invalid={!!bizErrors.city}
                    aria-describedby={bizErrors.city ? "err-city" : undefined}
                  />
                  {bizErrors.city && (
                    <Help id="err-city" tone="error">
                      Required
                    </Help>
                  )}
                  <TwoCol>
                    <div>
                      <Label htmlFor="state" style={{ visibility: "hidden" }}>
                        State
                      </Label>
                      <Select
                        id="state"
                        value={data.business.state}
                        onChange={(e) => {
                          onChangeBusiness({ state: e.target.value });
                          if (bizErrors.state)
                            setBizErrors((s) => ({ ...s, state: "" }));
                        }}
                        onBlur={(e) =>
                          setBizErrors((s) => ({
                            ...s,
                            state: validateField(
                              businessSchema,
                              "state",
                              e.target.value
                            ),
                          }))
                        }
                        invalid={!!bizErrors.state}
                        aria-invalid={!!bizErrors.state}
                        aria-describedby={
                          bizErrors.state ? "err-state" : undefined
                        }
                      >
                        <option value="" hidden>
                          State
                        </option>
                        {US_STATES.map((t) => (
                          <option key={t.name}>{t.name}</option>
                        ))}
                      </Select>
                      {bizErrors.state && (
                        <Help id="err-state" tone="error">
                          Required
                        </Help>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="zip" style={{ visibility: "hidden" }}>
                        Zip
                      </Label>
                      <Input
                        id="zip"
                        placeholder="Zip"
                        ref={(el) => (bizRefs.zip = el)}
                        value={data.business.zip}
                        onChange={(e) => {
                          onChangeBusiness({ zip: e.target.value });
                          if (bizErrors.zip)
                            setBizErrors((s) => ({ ...s, zip: "" }));
                        }}
                        onBlur={(e) =>
                          setBizErrors((s) => ({
                            ...s,
                            zip: validateField(
                              businessSchema,
                              "zip",
                              e.target.value
                            ),
                          }))
                        }
                        invalid={!!bizErrors.zip}
                        aria-invalid={!!bizErrors.zip}
                        aria-describedby={bizErrors.zip ? "err-zip" : undefined}
                      />
                      {bizErrors.zip && (
                        <Help id="err-zip" tone="error">
                          {bizErrors.zip}
                        </Help>
                      )}
                    </div>
                  </TwoCol>
                </Stack>
              </Fieldset>

              <Actions>
                <Primary type="submit" aria-disabled={busy}>
                  Continue →
                </Primary>
              </Actions>
            </Form>
          )}

          {step === 2 && (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                const { ok, errors } = validateAndFocus(
                  contactSchema,
                  data.contact,
                  ctcRefs
                );
                setCtcErrors(errors);
                if (ok) setStep(3);
              }}
              aria-labelledby="step2"
            >
              <TwoCol>
                <div>
                  <Label htmlFor="firstName">Name</Label>
                  <Input
                    id="firstName"
                    ref={(el) => (ctcRefs.firstName = el)}
                    placeholder="First name"
                    value={data?.contact?.firstName}
                    onChange={(e) => {
                      onChangeContact({ firstName: e.target.value });
                      if (ctcErrors.firstName)
                        setCtcErrors((s) => ({ ...s, firstName: "" }));
                    }}
                    onBlur={(e) =>
                      setCtcErrors((s) => ({
                        ...s,
                        firstName: validateField(
                          contactSchema,
                          "firstName",
                          e.target.value
                        ),
                      }))
                    }
                    invalid={!!ctcErrors.firstName}
                    aria-invalid={!!ctcErrors.firstName}
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" style={{ visibility: "hidden" }}>
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    ref={(el) => (ctcRefs.lastName = el)}
                    placeholder="Last name"
                    value={data?.contact?.lastName}
                    onChange={(e) => {
                      onChangeContact({ lastName: e.target.value });
                      if (ctcErrors.lastName)
                        setCtcErrors((s) => ({ ...s, lastName: "" }));
                    }}
                    onBlur={(e) =>
                      setCtcErrors((s) => ({
                        ...s,
                        lastName: validateField(
                          contactSchema,
                          "lastName",
                          e.target.value
                        ),
                      }))
                    }
                    invalid={!!ctcErrors.lastName}
                    aria-invalid={!!ctcErrors.lastName}
                  />
                </div>
              </TwoCol>

              {ctcErrors.firstName || ctcErrors.lastName ? (
                <Help tone="error">Enter first and last name</Help>
              ) : null}

              <Fieldset>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  ref={(el) => (ctcRefs.email = el)}
                  value={data?.contact?.email}
                  onChange={(e) => {
                    onChangeContact({ email: e.target.value });
                    if (ctcErrors.email)
                      setCtcErrors((s) => ({ ...s, email: "" }));
                  }}
                  onBlur={(e) =>
                    setCtcErrors((s) => ({
                      ...s,
                      email: validateField(
                        contactSchema,
                        "email",
                        e.target.value
                      ),
                    }))
                  }
                  invalid={!!ctcErrors.email}
                  aria-invalid={!!ctcErrors.email}
                  aria-describedby={ctcErrors.email ? "err-email" : undefined}
                />
                {ctcErrors.email ? (
                  <Help id="err-email" tone="error">
                    {ctcErrors.email}
                  </Help>
                ) : null}
              </Fieldset>

              <Fieldset>
                <Label htmlFor="phone">Phone</Label>
                <PhoneRow>
                  <CountryWrap>
                    <img
                      src={
                        COUNTRIES[Number(data?.contact?.countryCode)]?.flag_url
                      }
                      alt={`${
                        COUNTRIES[Number(data?.contact?.countryCode)]?.name
                      } flag`}
                      style={{
                        width: "24px",
                        height: "16px",
                        objectFit: "cover",
                        borderRadius: "2px",
                      }}
                    />
                    <Select
                      aria-label="Country"
                      value={data?.contact?.countryCode}
                      onChange={(e) =>
                        onChangeContact({ countryCode: e.target.value })
                      }
                    >
                      {COUNTRIES.map((c, idx) => (
                        <option key={c.name} value={String(idx)}>
                          {c.phone_code} {c.name}
                        </option>
                      ))}
                    </Select>
                  </CountryWrap>
                  <Input
                    id="phone"
                    type="tel"
                    ref={(el) => (ctcRefs.phone = el)}
                    placeholder="(000) 000-0000"
                    value={data?.contact?.phone}
                    onChange={(e) => {
                      onChangeContact({ phone: maskPhone(e.target.value) });
                      if (ctcErrors.phone)
                        setCtcErrors((s) => ({ ...s, phone: "" }));
                    }}
                    onBlur={(e) =>
                      setCtcErrors((s) => ({
                        ...s,
                        phone: validateField(
                          contactSchema,
                          "phone",
                          e.target.value
                        ),
                      }))
                    }
                    invalid={!!ctcErrors.phone}
                    aria-invalid={!!ctcErrors.phone}
                    aria-describedby={ctcErrors.phone ? "err-phone" : undefined}
                  />
                </PhoneRow>
                {ctcErrors.phone ? (
                  <Help id="err-phone" tone="error">
                    {ctcErrors.phone}
                  </Help>
                ) : null}
              </Fieldset>

              <Actions>
                <Primary type="submit" aria-disabled={busy}>
                  Continue →
                </Primary>
              </Actions>
            </Form>
          )}

          {step === 3 && (
            <div aria-labelledby="step3">
              <Legend id="step3">Review &amp; submit</Legend>

              <Section>
                <SectionHeader>
                  <SectionTitle>Business structure</SectionTitle>
                  {!navLocked && (
                    <EditLink onClick={() => setStep(1)}>Edit</EditLink>
                  )}
                </SectionHeader>
                <KV>
                  <dt>Name:</dt>
                  <dd>{data.business.businessName || "-"}</dd>
                  <dt>Type:</dt>
                  <dd>{data.business.businessType || "-"}</dd>
                  <dt>Address:</dt>
                  <dd>
                    <AddressReview>
                      <span>{data.business.address1 || "-"}</span>
                      {data.business.address2 ? (
                        <span>{data.business.address2}</span>
                      ) : null}
                      <span>
                        {(data.business.city || "-") +
                          (data.business.state
                            ? `, ${data.business.state}`
                            : "") +
                          (data.business.zip ? ` ${data.business.zip}` : "")}
                      </span>
                    </AddressReview>
                  </dd>
                </KV>
              </Section>

              <Section>
                <SectionHeader>
                  <SectionTitle>Contact person</SectionTitle>
                  {!navLocked && (
                    <EditLink onClick={() => setStep(2)}>Edit</EditLink>
                  )}
                </SectionHeader>
                <KV>
                  <dt>Name:</dt>
                  <dd>
                    {`${data?.contact?.firstName} ${data?.contact?.lastName}`.trim() ||
                      "-"}
                  </dd>
                  <dt>Email:</dt>
                  <dd>{data?.contact?.email || "-"}</dd>
                  <dt>Phone:</dt>
                  <dd>
                    {`${
                      COUNTRIES[Number(data?.contact?.countryCode)]
                        ?.phone_code || ""
                    } ${data?.contact?.phone || ""}`.trim() || "-"}
                  </dd>
                </KV>
              </Section>

              {!navLocked ? (
                <Actions>
                  <Primary onClick={submit} aria-disabled={busy}>
                    {busy ? "Submitting…" : "Confirm & Submit →"}
                  </Primary>
                </Actions>
              ) : (
                <Actions>
                  <Primary onClick={startOver}>Start Over →</Primary>
                </Actions>
              )}

              {submitState === "success" && submitMessage ? (
                <Muted tone="success">{submitMessage}</Muted>
              ) : null}
              {submitState === "error" && submitMessage ? (
                <Muted tone="error">{submitMessage}</Muted>
              ) : null}
            </div>
          )}
        </Right>
      </Grid>
    </Layout>
  );
}

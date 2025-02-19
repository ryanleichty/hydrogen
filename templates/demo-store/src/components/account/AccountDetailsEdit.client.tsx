import {useState} from 'react';

import {Text, Button} from '~/components';
import {
  emailValidation,
  passwordValidation,
  useRenderServerComponents,
} from '~/lib/utils';
import {getInputStyleClasses} from '~/lib/styleUtils';

interface FormElements {
  firstName: HTMLInputElement;
  lastName: HTMLInputElement;
  phone: HTMLInputElement;
  email: HTMLInputElement;
  currentPassword: HTMLInputElement;
  newPassword: HTMLInputElement;
  newPassword2: HTMLInputElement;
}

export function AccountDetailsEdit({
  firstName: _firstName = '',
  lastName: _lastName = '',
  phone: _phone = '',
  email: _email = '',
  close,
}: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  close: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(_firstName);
  const [lastName, setLastName] = useState(_lastName);
  const [phone, setPhone] = useState(_phone);
  const [email, setEmail] = useState(_email);
  const [emailError, setEmailError] = useState<null | string>(null);
  const [currentPasswordError, setCurrentPasswordError] = useState<
    null | string
  >(null);
  const [newPasswordError, setNewPasswordError] = useState<null | string>(null);
  const [newPassword2Error, setNewPassword2Error] = useState<null | string>(
    null,
  );
  const [submitError, setSubmitError] = useState<null | string>(null);

  // Necessary for edits to show up on the main page
  const renderServerComponents = useRenderServerComponents();

  async function onSubmit(
    event: React.FormEvent<HTMLFormElement & FormElements>,
  ) {
    event.preventDefault();

    setEmailError(null);
    setCurrentPasswordError(null);
    setNewPasswordError(null);
    setNewPassword2Error(null);

    const emailError = emailValidation(event.currentTarget.email);
    if (emailError) {
      setEmailError(emailError);
    }

    let currentPasswordError, newPasswordError, newPassword2Error;

    // Only validate the password fields if the current password has a value
    if (event.currentTarget.currentPassword.value) {
      currentPasswordError = passwordValidation(
        event.currentTarget.currentPassword,
      );
      if (currentPasswordError) {
        setCurrentPasswordError(currentPasswordError);
      }

      newPasswordError = passwordValidation(event.currentTarget.newPassword);
      if (newPasswordError) {
        setNewPasswordError(newPasswordError);
      }

      newPassword2Error =
        event.currentTarget.newPassword.value !==
        event.currentTarget.newPassword2.value
          ? 'The two passwords entered did not match'
          : null;
      if (newPassword2Error) {
        setNewPassword2Error(newPassword2Error);
      }
    }

    if (
      emailError ||
      currentPasswordError ||
      newPasswordError ||
      newPassword2Error
    ) {
      return;
    }

    setSaving(true);

    const accountUpdateResponse = await callAccountUpdateApi({
      email,
      newPassword: event.currentTarget.newPassword.value,
      currentPassword: event.currentTarget.currentPassword.value,
      phone,
      firstName,
      lastName,
    });

    setSaving(false);

    if (accountUpdateResponse.error) {
      setSubmitError(accountUpdateResponse.error);
      return;
    }

    renderServerComponents();
    close();
  }

  return (
    <>
      <Text className="mt-4 mb-6" as="h3" size="lead">
        Update your profile
      </Text>
      <form noValidate onSubmit={onSubmit}>
        {submitError && (
          <div className="flex items-center justify-center mb-6 bg-red-100 rounded">
            <p className="m-4 text-sm text-red-900">{submitError}</p>
          </div>
        )}
        <div className="mt-3">
          <input
            className={getInputStyleClasses()}
            id="firstname"
            name="firstname"
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            aria-label="First name"
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value);
            }}
          />
        </div>
        <div className="mt-3">
          <input
            className={getInputStyleClasses()}
            id="lastname"
            name="lastname"
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            aria-label="Last name"
            value={lastName}
            onChange={(event) => {
              setLastName(event.target.value);
            }}
          />
        </div>
        <div className="mt-3">
          <input
            className={getInputStyleClasses()}
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Mobile"
            aria-label="Mobile"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
            }}
          />
        </div>
        <div className="mt-3">
          <input
            className={getInputStyleClasses(emailError)}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email address"
            aria-label="Email address"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
          <p
            className={`text-red-500 text-xs ${!emailError ? 'invisible' : ''}`}
          >
            {emailError} &nbsp;
          </p>
        </div>
        <Text className="mb-6 mt-6" as="h3" size="lead">
          Change your password
        </Text>
        <Password
          name="currentPassword"
          label="Current password"
          passwordError={currentPasswordError}
        />
        <Password
          name="newPassword"
          label="New password"
          passwordError={newPasswordError}
        />
        <Password
          name="newPassword2"
          label="Re-enter new password"
          passwordError={newPassword2Error}
        />
        <Text
          size="fine"
          color="subtle"
          className={`mt-1 ${
            currentPasswordError || newPasswordError ? 'text-red-500' : ''
          }`}
        >
          Passwords must be at least 6 characters.
        </Text>
        {newPassword2Error ? <br /> : null}
        <Text
          size="fine"
          className={`mt-1 text-red-500 ${
            newPassword2Error ? '' : 'invisible'
          }`}
        >
          {newPassword2Error} &nbsp;
        </Text>
        <div className="mt-6">
          <Button
            className="text-sm mb-2"
            variant="primary"
            width="full"
            type="submit"
            disabled={saving}
          >
            Save
          </Button>
        </div>
        <div className="mb-4">
          <Button
            type="button"
            className="text-sm"
            variant="secondary"
            width="full"
            onClick={close}
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}

function Password({
  name,
  passwordError,
  label,
}: {
  name: string;
  passwordError: string | null;
  label: string;
}) {
  const [password, setPassword] = useState('');

  return (
    <div className="mt-3">
      <input
        className={getInputStyleClasses(passwordError)}
        id={name}
        name={name}
        type="password"
        autoComplete={
          name === 'currentPassword' ? 'current-password' : undefined
        }
        placeholder={label}
        aria-label={label}
        value={password}
        minLength={8}
        required
        onChange={(event) => {
          setPassword(event.target.value);
        }}
      />
    </div>
  );
}

export async function callAccountUpdateApi({
  email,
  phone,
  firstName,
  lastName,
  currentPassword,
  newPassword,
}: {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const res = await fetch(`/account`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        phone,
        firstName,
        lastName,
        currentPassword,
        newPassword,
      }),
    });
    if (res.ok) {
      return {};
    } else {
      return res.json();
    }
  } catch (_e) {
    return {
      error: 'Error saving account. Please try again.',
    };
  }
}

import React from "react";
import HttpClient from "./http/HttpClient";
import { getLocalUser, removeLocalUser, setLocalUser } from "./storage/settings";
import { useNavigate, useSearchParams } from "react-router-dom";

import "./Login.css";

enum LoginFormStatus {
  READY,
  ERROR,
  LOADING,
  COMPLETED,
}

enum RecoverKeyFormStatus {
  READY,
  ERROR,
  LOADING,
  COMPLETED,
}

export const FlashMessage: React.FC<{ type: FlashMessageType } & React.HTMLAttributes<HTMLDivElement>> = ({
  type,
  children,
  className,
}) => {
  return <div className={`flash-${type} p-3 ${className}`}>{children}</div>;
};

function Login() {
  const [email, setEmail] = React.useState("");
  const [key, setKey] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [, setCurrentUser] = React.useState<User | null>(null);
  const [formStatus, setFormStatus] = React.useState<LoginFormStatus>(LoginFormStatus.READY);
  const httpClient = new HttpClient();
  const [, setDialogIsOpen] = React.useState(false);
  const [emailRecoverKey, setEmailRecoverKey] = React.useState("");
  const [recoverKeyFormStatus, setRecoverKeyFormStatus] = React.useState<RecoverKeyFormStatus>(RecoverKeyFormStatus.READY);
  const [flashMessage, setFlashMessage] = React.useState<FlashMessage | null>(null);
  const history = useNavigate();
  const [searchParams] = useSearchParams();

  const recoverDialogRef = React.createRef<HTMLDialogElement>();

  React.useEffect(() => {
    async function getCurrentUser(email: string, key: string) {
      const res = await httpClient.get(`/api/user/currentUser`, {
        headers: {
          Authorization: `Basic ${btoa(email + ":" + key)}`,
        },
      });

      if (res.ok) {
        return (await res.json()) as User;
      }

      return null;
    }

    async function validateLocalUser() {
      const localUser = getLocalUser();

      if (!localUser) {
        setLoading(false);
        setCurrentUser(null);
        return;
      }

      const { email, key } = localUser;
      const currentUser = await getCurrentUser(email, key);
      setLoading(false);
      if (currentUser === null) {
        setCurrentUser(null);
      } else {
        setCurrentUser(currentUser);
        setLocalUser(currentUser);
      }
    }

    validateLocalUser();

    if (searchParams.has("recoverKey")) {
      recoverDialogRef.current?.removeAttribute("open");

      recoverDialogRef.current?.showModal();
    }
    // eslint-disable-next-line
  }, []);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.id === "email") {
      setEmail(event.target.value);
    } else if (event.target.id === "key") {
      setKey(event.target.value);
    } else if (event.target.id === "emailRecoverKey") {
      setEmailRecoverKey(event.target.value);
    }
  };

  const onClickRecoverKey = () => {
    // @ts-ignore
    recoverDialogRef.current?.showModal();
    setFlashMessage(null);
    setDialogIsOpen(true);
  };

  const onClickCloseDialog = () => {
    setDialogIsOpen(false);
    // @ts-ignore
    recoverDialogRef.current.close();
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const requestOptions = {
      body: JSON.stringify({
        email,
        key,
      }),
    };

    try {
      setFormStatus(LoginFormStatus.LOADING);
      const res = await httpClient.post(`/api/auth/login`, requestOptions);

      if (res.ok) {
        const user = (await res.json()) as User;
        setFormStatus(LoginFormStatus.READY);
        await setCurrentUser(user);
        await setLocalUser(user);
        const redirectUrl = new URLSearchParams(window.location.search).get("redirect") ?? "/new";
        return history(redirectUrl);
      } else {
        if (res.status === 401) {
          setFlashMessage({
            type: "error",
            message: "Invalid email or access key. Please try again.",
          });
        }
        setFormStatus(LoginFormStatus.ERROR);
        setCurrentUser(null);
        removeLocalUser();
      }
    } catch (err) {
      setFormStatus(LoginFormStatus.ERROR);
      setCurrentUser(null);
      removeLocalUser();
      console.error(err);
    }
  };

  const onSubmitRecoverKey = async (_event: React.FormEvent<HTMLFormElement>) => {
    const requestOptions = {
      body: JSON.stringify({
        email: emailRecoverKey,
      }),
    };

    try {
      setRecoverKeyFormStatus(RecoverKeyFormStatus.LOADING);

      const res = await httpClient.post(`/api/user/recover`, requestOptions);

      if (res.ok) {
        setRecoverKeyFormStatus(RecoverKeyFormStatus.COMPLETED);
        setFlashMessage({
          type: "success",
          message: `An email has been sent to ${emailRecoverKey} with your access key`,
        });
        setEmailRecoverKey("");
      } else if (res.status === 429) {
        setRecoverKeyFormStatus(RecoverKeyFormStatus.ERROR);
        setFlashMessage({
          type: "error",
          message: "Too many requests. Please try again later.",
        });
      }
    } catch (err) {
      setRecoverKeyFormStatus(RecoverKeyFormStatus.ERROR);
      setCurrentUser(null);
      removeLocalUser();
      setFlashMessage({
        type: "error",
        message: "An error occurred. Please try again.",
      });
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="login flex h-screen">
      <div className="m-auto">
        <section className="login p-6 bg-white ">
          <form onSubmit={onSubmit}>
            <div className="text-center mb-3">
              <img
                src={`${process.env.PUBLIC_URL}/logo-horizontal.png`}
                style={{
                  height: "50px",
                }}
                className="m-auto"
                alt="logo"
              />
            </div>
            <h2 className="text-center my-4">Login</h2>
            {flashMessage && (
              <FlashMessage type={flashMessage.type} className="my-3">
                {flashMessage.message}
              </FlashMessage>
            )}
            <p className="mt-0 mb-5">Please enter your email address and access key you received via email</p>
            <fieldset disabled={formStatus === LoginFormStatus.LOADING}>
              <div className="mb-4">
                <input
                  type="email"
                  id="email"
                  name="email"
                  spellCheck="false"
                  autoComplete="off"
                  required
                  onChange={onChange}
                  placeholder="Email address"
                  className="border border-slate-200 hover:border-slate-400 p-3 w-full"
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  id="key"
                  name="key"
                  spellCheck="false"
                  autoComplete="off"
                  required
                  onChange={onChange}
                  placeholder="Access key"
                  className="border border-slate-200 hover:border-slate-400 p-3 w-full"
                />
              </div>
              <div>
                <button type="submit" className=" px-4 py-2 bg-gray-900 text-gray-100 w-full">
                  {formStatus === LoginFormStatus.LOADING ? "Validating" : "Continue"}
                </button>
              </div>
            </fieldset>
          </form>
          <div className="mt-4">
            Don't have an account?{" "}
            <a
              href="https://explaindev.typeform.com/signup?origin=webapp"
              title="Create a new account"
              target="_blank"
              className="underline  font-bold"
              rel="noreferrer"
            >
              Create one
            </a>
          </div>
        </section>
        <div className="d-inline">
          <button type="button" onClick={onClickRecoverKey} className="b-0 link font-size-1 mt-3 hover:underline">
            I lost my access key :(
          </button>
        </div>
      </div>
      <dialog className="round b-0 p-5 bg-white" ref={recoverDialogRef}>
        <section className="recover-key">
          <h3 className="mb-5">Send access key to my email</h3>
          <p className="mb-3">We'll send it to the email address you used to sign up</p>
          <form onSubmit={onSubmitRecoverKey} method="dialog" className="space-y-3">
            <div>
              <input
                type="email"
                id="emailRecoverKey"
                name="emailRecoverKey"
                spellCheck="false"
                autoComplete="off"
                required
                onChange={onChange}
                placeholder="Email address"
                className="border border-slate-200 hover:border-slate-400 p-3 w-full"
                autoFocus
              />
            </div>
            <div className="flex space-x-4 ">
              <button
                type="button"
                onClick={onClickCloseDialog}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 duration-300"
              >
                Close
              </button>

              <button
                type="submit"
                className=" px-4 py-2 bg-gray-900 text-gray-100"
                disabled={recoverKeyFormStatus === RecoverKeyFormStatus.LOADING}
              >
                {recoverKeyFormStatus === RecoverKeyFormStatus.LOADING ? "Sending..." : "Send access key"}
              </button>
            </div>
          </form>
        </section>
      </dialog>
    </main>
  );
}

export default Login;

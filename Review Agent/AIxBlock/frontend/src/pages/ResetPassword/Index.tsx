import { useNavigate } from "react-router-dom";
import React, { ReactNode, useEffect, useMemo, useState } from "react";
import Button from "@/components/Button/Button";
import { useAuth } from "@/providers/AuthProvider";
import { useApi } from "@/providers/ApiProvider";
import "./Index.scss";
import { createAlert } from "@/utils/createAlert";
import useUrlQuery from "@/hooks/useUrlQuery";
import { validateEmail } from "@/utils/validators";
import { infoDialog } from "@/components/Dialog";

export default function ResetPassword() {
  const navigate = useNavigate();
  const queries = useUrlQuery();
  const uidb64 = queries.get("uidb64");
  const token = queries.get("token");
  const api = useApi();
  const auth = useAuth();
  const { user, errorResetPassword, logout } = auth;
  const [error, setError] = useState<{ [k: string]: string[] } | string | null>(
    null
  );
  const [data, setData] = useState({ email: "", pass: "", confirmPass: "" });
  const { email, pass, confirmPass } = data;

  const isConfirmPage = useMemo(
    () => !Boolean(uidb64 && token),
    [uidb64, token]
  );

  const errorNode = useMemo(() => {
    if (error && typeof error === "string") {
      return createAlert(error, undefined, false, { marginBottom: 16 });
    }

    if (error && typeof error === "object") {
      const msg: ReactNode[] = [];
      const fields = Object.keys(error);

      for (let i = 0; i < fields.length; i++) {
        const name = fields[i];

        if (!Array.isArray(error[name]) || error[name].length === 0) {
          continue;
        }

        msg.push(
          <div style={{ marginBottom: 8 }}>
            <strong>{name.toUpperCaseFirst()}</strong>: {error[name][0]}
          </div>
        );
      }

      return createAlert(msg, undefined, false, { marginBottom: 16 });
    }

    return null;
  }, [error]);

  useEffect(() => {
    if (!isConfirmPage && pass && confirmPass && pass !== confirmPass) {
      setError("Password and confirm password don't match.");
    } else {
      setError(null);
    }
  }, [pass, confirmPass, isConfirmPage]);

  useEffect(() => {
    if (isConfirmPage && user?.email && email !== user?.email) {
      setError("You have entered an invalid email address.");
    } else if (isConfirmPage && !user?.email && !validateEmail(email)) {
      setError("You have entered an invalid email address.");
    } else {
      setError(null);
    }
  }, [isConfirmPage, email, user?.email]);

  useEffect(() => {
    setError(errorResetPassword);
  }, [errorResetPassword]);

  useEffect(() => {}, [error]);

  const checkDisableBtnReset = () =>
    isConfirmPage ? !email : !pass || !confirmPass || pass !== confirmPass;

  const handleSubmit = async () => {
    if (isConfirmPage) {
      const response = await auth.resetPassword({
        email: email,
        csrfmiddlewaretoken: api.getCsrfToken(),
      });
      if (response.ok) {
        infoDialog({
          message: "Password reset link has been sent to your email",
        });
      } else {
        infoDialog({ message: "Can't find your email" });
      }
    } else {
      const response = await auth.updateResetPassword({
        password: pass,
        uidb64: uidb64 ?? "",
        token: token ?? "",
        csrfmiddlewaretoken: api.getCsrfToken(),
      });
      if (response.ok) {
        infoDialog({
          message: "Your password has been reset successfully",
        });
        if (user?.id) {
          logout(false);
        } else {
          navigate("/user/login");
        }
      } else {
        infoDialog({
          message: "Unable to reset your password",
        });
      }
    }
  };

  return (
    <div className="reset-password">
      <div className="reset-password-left">
        <div className="reset-password-left-content">
          <img src={require("@/assets/images/logo.png")} alt="Logo" />
          <span className="reset-password-left-text">
            An End-to-End AI Platform that integrates with <br />
            Decentralized Computing Resources
          </span>
        </div>
      </div>
      <div className="reset-password-right">
        <div className="reset-password-content">
          <div className="reset-password-content__title">
            {isConfirmPage ? "Confirm your Email" : "Reset Password"}
          </div>
          {errorNode}
          {isConfirmPage ? (
            <div className="reset-password-content__input">
              <input
                type="email"
                placeholder="Email"
                className="email-confirm"
                value={email}
                onChange={(event) =>
                  setData({ ...data, email: event.target.value })
                }
              />
            </div>
          ) : (
            <div className="reset-password-content__input">
              <input
                type="password"
                placeholder="Password"
                className="password_signup"
                value={pass}
                onChange={(event) =>
                  setData({ ...data, pass: event.target.value })
                }
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="password"
                value={confirmPass}
                onChange={(event) =>
                  setData({ ...data, confirmPass: event.target.value })
                }
              />
            </div>
          )}

          <div className="reset-password-content__group-btn">
            <Button
              type="white"
              onClick={() => {
                if (user?.id) {
                  navigate(-1);
                } else {
                  navigate("/user/login");
                }
              }}
            >
              {user?.id ? "Go Back" : "Sign In"}
            </Button>
            <Button
              type="gradient"
              disabled={checkDisableBtnReset()}
              onClick={handleSubmit}
            >
              {isConfirmPage ? "Confirm" : "Update"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

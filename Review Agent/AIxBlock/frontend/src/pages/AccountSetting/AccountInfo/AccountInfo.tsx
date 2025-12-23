import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { infoDialog } from "@/components/Dialog";
import { useUserLayout } from "@/layouts/UserLayout";
import { TUserModel } from "@/models/user";
import { useAccountSettingContext } from "@/providers/AccountSettingProvider";
import { useAuth } from "@/providers/AuthProvider";
import "./AccountInfo.scss";
import { useApi } from "@/providers/ApiProvider";
import Modal from "@/components/Modal/Modal";
import {randomUsername} from "@/utils/random";

const AccountSettingContent = ({ user }: { user: TUserModel }) => {
  const userLayout = useUserLayout();
  const navigate = useNavigate();
  const [curlCommand, setCurlCommand] = useState<string>("");
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { getUserToken, resetToken, updateUser, state } = useAccountSettingContext();
  // const [notificationSetting, setNotificationSetting] = useState(false);
  const [userData, setUserData] = useState<TUserModel>(user);
  const api = useApi();
  const auth = useAuth();
  const [isOpenModalConfirm, setIsOpenModalConfirm] = useState(false);

  const hostname = useMemo(() => {
    let h = window.APP_SETTINGS.hostname;

    if (!h.startsWith("http")) {
      h = window.location.protocol + "//" + window.location.host;
    }

    if (!h.endsWith("/")) {
      h += "/";
    }

    return h;
  }, []);

  useEffect(() => {
    if (state.data.token.length === 0) {
      getUserToken({});
    }
  }, [getUserToken, state.data.token]);

  useEffect(() => {
    if (state.data.token && state.data.token.length > 0) {
      setCurlCommand(
        `curl -X GET ${hostname}api/projects/ -H 'Authorization: Token ${state.data.token[0].token.token}'`
      );
    }
  }, [state.data.token, hostname]);

  useEffect(() => {
    userLayout.setBreadcrumbs([{ label: "Profile Settings" }]);

    return () => {
      userLayout.clearBreadcrumbs();
    };
  }, [userLayout]);

  const handleResetPassword = () => {
    navigate("/user/reset-password");
  };

  const handleActionDeleteAcct = async () => {
    const { user, terminateSession } = auth
    setIsOpenModalConfirm(false)
    const ar = api.call("deleteAccount", {
      params: { id: user?.id as any },
    });
    ar.promise.then(async (r) => {
      if (r.ok) {
        terminateSession()
      } else {
        const data = await r.json();
        if (Object.hasOwn(data, "detail")) {
          infoDialog({ message: data.detail });
        } else {
          infoDialog({ message: r.statusText });
        }
      }
    });
  };

  const handleDeleteAccount = () => {
    setIsOpenModalConfirm(true)
  };

  const triggerFileInput = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      updateUser({...user}, inputFileRef.current?.files ?? undefined);
      setUserData((prevUserData) => ({
        ...prevUserData,
        avatar: URL.createObjectURL(file),
      }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleAccessTokenCopy = () => {
    if (state.data.token[0]?.token?.token) {
      navigator.clipboard
        .writeText(state.data.token[0].token.token)
        .catch(console.error);
      infoDialog({ message: "Access token copied successfully!" });
    }
  };

  const handleCurlCommandCopy = () => {
    navigator.clipboard.writeText(curlCommand).catch(console.error);
    infoDialog({ message: "Curl command copied successfully!" });
  };

  const callResetToken = () => {
    resetToken({});
  };

  const handleUpdateUser = () => {
    if ((userData.username ?? "").trim().length === 0) {
      const username = randomUsername();
      updateUser({...userData, username}, inputFileRef.current?.files ?? undefined);
      setUserData({...userData, username});
    } else {
      updateUser(userData, inputFileRef.current?.files ?? undefined);
    }
  };

  return (
    <div className="c-account-setting-wrapper">
      <div className="c-account-setting__avatar-group">
        <div className="c-account-setting__avatar-upload">
          <div className="c-account-setting__avatar-container">
            <img
              className="c-account-setting__avatar"
              src={
                userData.avatar && userData.avatar.length > 0
                  ? userData.avatar
                  : require("@/assets/images/no-avatar.jpg")
              }
              alt="Avatar"
            />
            <svg width="25" height="25" viewBox="12 6 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={triggerFileInput}>
              <g filter="url(#filter0_d_547_28728)">
                <rect x="12" y="6" width="25" height="25" rx="12.5" fill="#A3A3BA"/>
                <path
                  d="M29.4632 24.0147H19.5368C19.3107 24.0147 19.1232 23.8272 19.1232 23.6011C19.1232 23.375 19.3107 23.1875 19.5368 23.1875H29.4632C29.6893 23.1875 29.8768 23.375 29.8768 23.6011C29.8768 23.8272 29.6893 24.0147 29.4632 24.0147Z"
                  fill="white"/>
                <path
                  d="M28.3713 13.8015C27.3015 12.7316 26.2537 12.704 25.1562 13.8015L24.489 14.4688C24.4338 14.5239 24.4118 14.6121 24.4338 14.6893C24.8529 16.1507 26.0221 17.3199 27.4835 17.739C27.5055 17.7445 27.5276 17.75 27.5496 17.75C27.6103 17.75 27.6654 17.7279 27.7096 17.6838L28.3713 17.0165C28.9173 16.4761 29.182 15.9522 29.182 15.4228C29.1875 14.8768 28.9228 14.3474 28.3713 13.8015Z"
                  fill="white"/>
                <path
                  d="M26.4908 18.2408C26.3309 18.1636 26.1765 18.0864 26.0276 17.9982C25.9063 17.9265 25.7904 17.8493 25.6746 17.7665C25.5809 17.7059 25.4706 17.6176 25.3658 17.5294C25.3548 17.5239 25.3162 17.4908 25.2721 17.4467C25.0901 17.2923 24.886 17.0938 24.704 16.8732C24.6875 16.8621 24.6599 16.8235 24.6213 16.7739C24.5662 16.7077 24.4724 16.5974 24.3897 16.4706C24.3235 16.3879 24.2463 16.2665 24.1746 16.1452C24.0864 15.9963 24.0092 15.8474 23.932 15.693C23.8308 15.4761 23.5461 15.4117 23.3768 15.5809L20.2757 18.682C20.204 18.7537 20.1379 18.8915 20.1213 18.9853L19.8235 21.0974C19.7684 21.4724 19.8732 21.8254 20.1048 22.0625C20.3033 22.2555 20.579 22.3603 20.8768 22.3603C20.943 22.3603 21.0092 22.3548 21.0754 22.3437L23.193 22.046C23.2923 22.0294 23.4302 21.9632 23.4963 21.8915L26.6025 18.7854C26.7684 18.6195 26.7061 18.3341 26.4908 18.2408Z"
                  fill="white"/>
              </g>
              <defs>
                <filter id="filter0_d_547_28728" x="0" y="0" width="49" height="49" filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                 result="hardAlpha"/>
                  <feOffset dy="6"/>
                  <feGaussianBlur stdDeviation="6"/>
                  <feColorMatrix type="matrix"
                                 values="0 0 0 0 0.145098 0 0 0 0 0.145098 0 0 0 0 0.145098 0 0 0 0.1 0"/>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_547_28728"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_547_28728" result="shape"/>
                </filter>
              </defs>
            </svg>
          </div>
          <input
            ref={inputFileRef}
            className="c-account-setting__avatar-upload-input"
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            defaultValue={""}
          />
        </div>
        <div className="c-account-setting__info">
          <div className="c-account-setting__info-username">{user.username}</div>
          <div className="c-account-setting__info-email">{user.email}</div>
        </div>
      </div>
      <div style={{flexBasis: "100%"}}></div>
      <div className="c-account-setting__left">
        <form className="c-account-setting__form" onSubmit={handleFormSubmit}>
          <div className="c-account-setting__input-group">
            <label className="c-account-setting__label" htmlFor="firstName">
              First Name
            </label>
            <input
              className="c-account-setting__input"
              type="text"
              id="firstName"
              placeholder=""
              value={userData.first_name}
              onChange={(e) =>
                setUserData((prevUserData) => ({
                  ...prevUserData,
                  first_name: e.target.value,
                }))
              }
            />
          </div>
          <div className="c-account-setting__input-group">
            <label className="c-account-setting__label" htmlFor="lastName">
              Last Name
            </label>
            <input
              className="c-account-setting__input"
              type="text"
              id="lastName"
              placeholder=""
              value={userData.last_name}
              onChange={(e) =>
                setUserData((prevUserData) => ({
                  ...prevUserData,
                  last_name: e.target.value,
                }))
              }
            />
          </div>
          <div className="c-account-setting__input-group">
            <label className="c-account-setting__label" htmlFor="userName">
              Username
            </label>
            <input
              className="c-account-setting__input"
              type="text"
              id="userName"
              placeholder=""
              value={userData.username}
              onChange={(e) =>
                setUserData((prevUserData) => ({
                  ...prevUserData,
                  username: e.target.value,
                }))
              }
            />
          </div>
          <button
            className="c-account-setting__button c-account-setting__button-save"
            type="submit"
            onClick={handleUpdateUser}
          >
            Save your information
          </button>
          <div className="c-account-setting__buttons-split">
            <span
              className="c-account-setting__button-reset"
              onClick={handleResetPassword}
            >
              Reset Password
            </span>
            <span
              className="c-account-setting__button-delete"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </span>
          </div>
        </form>
      </div>
      <div className="c-account-setting__right">
        <div className="c-account-setting__access-token">
          <h2 className="c-account-setting__access-token-title">
            Access Token
          </h2>
          <p className="c-account-setting__access-token-description">
            Use this token to authenticate with our API.
          </p>
          <div className="c-account-setting__access-token-value">
            <div className="c-account-setting__input-container">
              <input
                className="c-account-setting__access-token-input"
                type="text"
                value={state.data.token[0]?.token?.token ?? ""}
                onChange={() => {
                  return;
                }}
              />
              <div className="c-account-setting__button-container">
                <button
                  className="c-account-setting__access-token-button-black"
                  onClick={handleAccessTokenCopy}
                >
                  Copy
                </button>
                <button
                  className="c-account-setting__button btn-renew"
                  onClick={callResetToken}
                >
                  Renew
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="c-account-setting__access-token">
          <p className="c-account-setting__access-token-description">
            Example fetch projects data:
          </p>
          <div className="c-account-setting__access-token-value">
            <div className="c-account-setting__input-container">
              <textarea
                className="c-account-setting__access-token-input textarea"
                rows={4}
                value={curlCommand}
                onChange={handleCurlCommandCopy}
              ></textarea>
              <div className="c-account-setting__button-container">
                <button
                  className="c-account-setting__access-token-button-black"
                  onClick={handleCurlCommandCopy}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
        {/*<div className="c-account-setting__notifications">
          <h2 className="c-account-setting__notifications-title">
            Notifications
          </h2>
          <p className="c-account-setting__notifications-description">
            Email and other notifications
          </p>
          <div className="c-account-setting__notifications-settings">
            <div className="c-account-setting__notifications-setting">
              <input
                className="c-account-setting__notifications-setting-checkbox"
                type="radio"
                id="notification-setting-1"
                defaultValue={""}
                checked={notificationSetting}
                onClick={() => {
                  setNotificationSetting(!notificationSetting);
                }}
                onChange={() => {
                  return true;
                }}
              />
              <label
                className="c-account-setting__notifications-setting-label"
                htmlFor="notification-setting-1"
              >
                Get the latest news & tips from AIxBlock
              </label>
            </div>
          </div>
        </div>*/}
      </div>
      <Modal
        title="Confirm"
        cancelText="No"
        submitText="Yes"
        closeOnOverlayClick={false}
        open={isOpenModalConfirm}
        onClose={() => setIsOpenModalConfirm(false)}
        className="c-crowds__modal-manager"
        onCancel={() => setIsOpenModalConfirm(false)}
        onSubmit={() => handleActionDeleteAcct()}
      >
        Are you sure you want to delete your account?
      </Modal>
    </div>
  );
};

export default function AccountSetting() {
  const {user} = useAuth();

  if (!user) {
    return <>Please login first.</>;
  }

  return <AccountSettingContent user={user}/>;
}

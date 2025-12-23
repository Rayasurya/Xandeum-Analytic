import {TModelMarketplace} from "@/models/modelMarketplace";
import {Fragment, MouseEventHandler, useMemo} from "react";
import styles from "./Item.module.scss";
import {formatDateTime} from "@/utils/formatDate";
import { convertHtmlToText } from "@/utils/html";
import UserName from "../UserName/UserName";

const TagIcon = ({...props}) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M14.8725 6.52485L11.475 3.12735C10.7625 2.41485 9.77998 2.03235 8.77498 2.08485L5.02498 2.26485C3.52498 2.33235 2.33248 3.52485 2.25748 5.01735L2.07748 8.76735C2.03248 9.77235 2.40748 10.7549 3.11998 11.4674L6.51748 14.8649C7.91248 16.2599 10.1775 16.2599 11.58 14.8649L14.8725 11.5724C16.275 10.1849 16.275 7.91985 14.8725 6.52485ZM7.12498 9.28485C5.93248 9.28485 4.96498 8.31735 4.96498 7.12485C4.96498 5.93235 5.93248 4.96485 7.12498 4.96485C8.31748 4.96485 9.28498 5.93235 9.28498 7.12485C9.28498 8.31735 8.31748 9.28485 7.12498 9.28485Z"
      fill="#292D32"/>
  </svg>
)

const LikeIcon = ({...props}) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M8.41337 13.8731C8.18671 13.9531 7.81337 13.9531 7.58671 13.8731C5.65337 13.2131 1.33337 10.4597 1.33337 5.79307C1.33337 3.73307 2.99337 2.06641 5.04004 2.06641C6.25337 2.06641 7.32671 2.65307 8.00004 3.55974C8.67337 2.65307 9.75337 2.06641 10.96 2.06641C13.0067 2.06641 14.6667 3.73307 14.6667 5.79307C14.6667 10.4597 10.3467 13.2131 8.41337 13.8731Z"
      stroke="#6F728F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const DownloadIcon = ({...props}) => (
  <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M9.16667 9.05719L12.2712 5.95262L13.214 6.89543L8.5 11.6095L3.78595 6.89543L4.72876 5.95262L7.83333 9.05719V2H9.16667V9.05719Z"
      fill="#6F728F"/>
    <path
      d="M3.83333 10V12.6667H13.1667V10H14.5V12.6667C14.5 13.403 13.903 14 13.1667 14H3.83333C3.09695 14 2.5 13.403 2.5 12.6667V10H3.83333Z"
      fill="#6F728F"/>
  </svg>
)

const DotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="5" height="4" viewBox="0 0 5 4" fill="none">
    <circle cx="2.75" cy="2" r="2" fill="#6F728F"/>
  </svg>
)

// const WhiteDollarIcon = () => (
//   <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path
//       d="M9.5625 11.9402H10.05C10.5375 11.9402 10.9425 11.5052 10.9425 10.9802C10.9425 10.3277 10.71 10.2002 10.3275 10.0652L9.57 9.80273V11.9402H9.5625Z"
//       fill="white"/>
//     <path
//       d="M8.97755 1.42482C4.83755 1.43982 1.48505 4.80732 1.50005 8.94732C1.51505 13.0873 4.88255 16.4398 9.02255 16.4248C13.1625 16.4098 16.515 13.0423 16.5 8.90232C16.4851 4.76232 13.1175 1.41732 8.97755 1.42482ZM10.6951 8.99982C11.2801 9.20232 12.0676 9.63732 12.0676 10.9798C12.0676 12.1348 11.16 13.0648 10.05 13.0648H9.56255V13.4998C9.56255 13.8073 9.30755 14.0623 9.00005 14.0623C8.69255 14.0623 8.43755 13.8073 8.43755 13.4998V13.0648H8.16755C6.93755 13.0648 5.94005 12.0298 5.94005 10.7548C5.94005 10.4473 6.19505 10.1923 6.50255 10.1923C6.81005 10.1923 7.06505 10.4473 7.06505 10.7548C7.06505 11.4073 7.56005 11.9398 8.16755 11.9398H8.43755V9.40482L7.30505 8.99982C6.72005 8.79732 5.93255 8.36232 5.93255 7.01982C5.93255 5.86482 6.84005 4.93482 7.95005 4.93482H8.43755V4.49982C8.43755 4.19232 8.69255 3.93732 9.00005 3.93732C9.30755 3.93732 9.56255 4.19232 9.56255 4.49982V4.93482H9.83255C11.0625 4.93482 12.0601 5.96982 12.0601 7.24482C12.0601 7.55232 11.805 7.80732 11.4976 7.80732C11.1901 7.80732 10.9351 7.55232 10.9351 7.24482C10.9351 6.59232 10.4401 6.05982 9.83255 6.05982H9.56255V8.59482L10.6951 8.99982Z"
//       fill="white"/>
//     <path
//       d="M7.06494 7.02707C7.06494 7.67957 7.29744 7.80707 7.67994 7.94207L8.43744 8.20457V6.05957H7.94994C7.46244 6.05957 7.06494 6.49457 7.06494 7.02707Z"
//       fill="white"/>
//   </svg>
// )

const BlueDollarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9.5625 11.9402H10.05C10.5375 11.9402 10.9425 11.5052 10.9425 10.9802C10.9425 10.3277 10.71 10.2002 10.3275 10.0652L9.57 9.80273V11.9402H9.5625Z"
      fill="#5050FF"/>
    <path
      d="M8.97755 1.42482C4.83755 1.43982 1.48505 4.80732 1.50005 8.94732C1.51505 13.0873 4.88255 16.4398 9.02255 16.4248C13.1625 16.4098 16.515 13.0423 16.5 8.90232C16.4851 4.76232 13.1175 1.41732 8.97755 1.42482ZM10.6951 8.99982C11.2801 9.20232 12.0676 9.63732 12.0676 10.9798C12.0676 12.1348 11.16 13.0648 10.05 13.0648H9.56255V13.4998C9.56255 13.8073 9.30755 14.0623 9.00005 14.0623C8.69255 14.0623 8.43755 13.8073 8.43755 13.4998V13.0648H8.16755C6.93755 13.0648 5.94005 12.0298 5.94005 10.7548C5.94005 10.4473 6.19505 10.1923 6.50255 10.1923C6.81005 10.1923 7.06505 10.4473 7.06505 10.7548C7.06505 11.4073 7.56005 11.9398 8.16755 11.9398H8.43755V9.40482L7.30505 8.99982C6.72005 8.79732 5.93255 8.36232 5.93255 7.01982C5.93255 5.86482 6.84005 4.93482 7.95005 4.93482H8.43755V4.49982C8.43755 4.19232 8.69255 3.93732 9.00005 3.93732C9.30755 3.93732 9.56255 4.19232 9.56255 4.49982V4.93482H9.83255C11.0625 4.93482 12.0601 5.96982 12.0601 7.24482C12.0601 7.55232 11.805 7.80732 11.4976 7.80732C11.1901 7.80732 10.9351 7.55232 10.9351 7.24482C10.9351 6.59232 10.4401 6.05982 9.83255 6.05982H9.56255V8.59482L10.6951 8.99982Z"
      fill="#5050FF"/>
    <path
      d="M7.06494 7.02707C7.06494 7.67957 7.29744 7.80707 7.67994 7.94207L8.43744 8.20457V6.05957H7.94994C7.46244 6.05957 7.06494 6.49457 7.06494 7.02707Z"
      fill="#5050FF"/>
  </svg>
)

const DeleteIcon = () => (
  <svg width={35} height={34} viewBox="0 0 41 40" xmlns="http://www.w3.org/2000/svg" fill="none">
    <g filter="url(#a)">
      <rect width={40} height={40} x={1} fill="#fff" rx={8}/>
      <rect width={39} height={39} x={1.5} y={0.5} stroke="#DEDEEC" rx={7.5}/>
      <path stroke="#14142A" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M27.75 15.485a76.276 76.276 0 0 0-7.515-.375c-1.485 0-2.97.075-4.455.225l-1.53.15M18.375 14.727l.165-.982c.12-.712.21-1.245 1.477-1.245h1.966c1.267 0 1.364.563 1.477 1.252l.165.975M26.137 17.855l-.487 7.552c-.082 1.178-.15 2.093-2.242 2.093h-4.816c-2.092 0-2.16-.915-2.242-2.093l-.488-7.552M19.748 23.375h2.497M19.125 20.375h3.75"/>
    </g>
    <defs>
      <filter id="a" width={42} height={42} x={0} y={0} colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
        <feFlood floodOpacity={0} result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
        <feMorphology in="SourceAlpha" radius={1} result="effect1_dropShadow_412_45326"/>
        <feOffset dy={1}/>
        <feGaussianBlur stdDeviation={1}/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix values="0 0 0 0 0.0666667 0 0 0 0 0.0470588 0 0 0 0 0.133333 0 0 0 0.08 0"/>
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_412_45326"/>
        <feBlend in="SourceGraphic" in2="effect1_dropShadow_412_45326" result="shape"/>
      </filter>
    </defs>
  </svg>
)

const ConfigureIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 41 40" width={ 34 } height={ 34 }>
    <g filter="url(#a)">
      <rect width={ 40 } height={ 40 } x={ 1 } fill="#fff" rx={ 8 }/>
      <rect width={ 39 } height={ 39 } x={ 1.5 } y={ 0.5 } stroke="#DEDEEC" rx={ 7.5 }/>
      <path stroke="#14142A" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" transform="scale(1)  translate(8, 8)"
            d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
    </g>
    <defs>
      <filter id="a" width={ 42 } height={ 42 } x={ 0 } y={ 0 } colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse">
        <feFlood floodOpacity={ 0 } result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
        <feMorphology in="SourceAlpha" radius={ 1 } result="effect1_dropShadow_412_45326"/>
        <feOffset dy={ 1 }/>
        <feGaussianBlur stdDeviation={ 1 }/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix values="0 0 0 0 0.0666667 0 0 0 0 0.0470588 0 0 0 0 0.133333 0 0 0 0.08 0"/>
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_412_45326"/>
        <feBlend in="SourceGraphic" in2="effect1_dropShadow_412_45326" result="shape"/>
      </filter>
    </defs>
  </svg>

)

export type TModelItemProps = {
  catalogName?: string;
  model: TModelMarketplace;
  onClick?: MouseEventHandler;
  noPrice?: boolean;
  onDelete?: () => void;
  version?: string;
  onConfigure?: () => void;
}

export default function ModelItem({
  catalogName,
  model,
  onClick,
  noPrice,
  onDelete,
  version,
  onConfigure
}: TModelItemProps) {
  const desc = useMemo(() => {
    return model.model_desc ? convertHtmlToText(model.model_desc) : "";
  }, [ model.model_desc ]);

  const isSupportDDP = useMemo(() => {
    try {
      const cfg = JSON.parse(model.config ?? "{}");
      return !!cfg.is_support_ddp;
    } catch {
    }

    return false;
  }, [model.config]);

  return (
    <div className={ styles.container } onClick={ onClick }>
      <div className={ styles.top }>
        <img
          className={ styles.logo }
          src={ model.file ? model.file : require("@/assets/images/logo.png") }
          alt={ model.name }
        />
        <div className={ styles.badges }>
          {isSupportDDP && <span><strong>DDP</strong></span>}
          { onConfigure && (
            <span onClick={ev => {
              ev.stopPropagation();
              ev.preventDefault();
              onConfigure();
            }} style={{cursor: "pointer"}}>
              <ConfigureIcon />
            </span>
          )}
          {onDelete && (
            <span onClick={ev => {
              ev.stopPropagation();
              ev.preventDefault();
              onDelete();
            }} style={{cursor: "pointer"}}>
              <DeleteIcon />
            </span>
          )}
          {!noPrice && (
            model.price > 0
              ? (
                <span className={styles.price}>
                  <BlueDollarIcon/>
                  ${model.price}
                </span>
              ) : (
                <span className={styles.free}>
                  <BlueDollarIcon/>
                  FREE
                </span>
              )
          )}
        </div>
      </div>
        
      <div className={styles.name}>{model.id} - {model.model_name ? model.model_name  : model.name}{version ? " - " + version : ''}</div>
      {desc.length > 0 && (
        <div className={styles.desc}>
          {desc.length > 190 ? desc.substring(0, 190) + "..." : desc}
        </div>
      )}
      <div className={styles.bottom}>
        {catalogName && (
          <>
            <span>
              <TagIcon/>
              {catalogName}
            </span>
            <DotIcon/>
          </>
        )}
        <span>
          Author: <UserName userID={model.author_id} />
        </span>
        <DotIcon/>
        <span>
          {model.updated_at ? `updated ${formatDateTime(model.updated_at)}` : null}
        </span>
        <DotIcon/>
        <span>
          <LikeIcon/>
          {model.like_count}
        </span>
        <DotIcon/>
        <span>
          <DownloadIcon/>
          {model.download_count}
        </span>
        <DotIcon/>
        <span>
          Usage Count: {model.total_user_rent}
        </span>
        {model.tasks.length > 0 && model.tasks.map(t => (
          <Fragment key={"task-" + model.id + "-" + t.id}>
            <DotIcon/>
            <span title={t.description}>
              <TagIcon/>
              {t.name}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

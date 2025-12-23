import dayjs from 'dayjs';

export const formatDateTime = (date: string) => {
  const dateTime = dayjs(date);
  const formattedDateTime = dateTime.format("DD MMM 'YY, HH:mm");
  return formattedDateTime;
}

export const formatDate = (date: string | Date, formatType: string) => {
  const dateTime = dayjs(date);
  const formattedDate = dateTime.format(formatType);
  return formattedDate;
}


// convert date from March-07-2024 to 03/07/2024
export function convertDate(dateString: string) {
  const months = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const parts = dateString.split("-");

  const month = months[parts[0] as keyof typeof months];
  const day = parts[1];
  const year = parts[2];

  return `${month}/${day}/${year}`;
}
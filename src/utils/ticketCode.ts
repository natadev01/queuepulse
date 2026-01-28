export const formatTicketCode = (value: number) => {
  return `Q-${String(value).padStart(3, "0")}`;
};

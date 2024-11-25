
interface RideConfirmRequest {
  customer_id: number,
  origin: string,
  destination: string,
  distance: number,
  duration: string,
  driver: {
    id: number,
    name: string,
  },
  value: number,
}

export { RideConfirmRequest };

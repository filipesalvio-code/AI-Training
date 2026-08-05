type WeatherErrorMessageProps = {
  message: string;
};

export function WeatherErrorMessage({ message }: WeatherErrorMessageProps) {
  return <p role="alert" className="weather-error">{message}</p>;
}

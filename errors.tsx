type ErrormessagesProps = {
  errors?: {
    _errors?: string[]
  };
};

export function ErrorMessages({ errors }: ErrormessagesProps) {
  return errors && (
    <ul>
      {errors._errors?.map((error) => (
        <li className="text-red-600">{error}</li>
      ))}
    </ul>
  );
}
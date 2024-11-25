
class InvalidDataError extends Error {
  constructor(message: string, name?: string) {
    super(message);
    this.name = name || "NOT_FOUND";
  }
}

export { InvalidDataError };

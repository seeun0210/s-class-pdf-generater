export interface DataConverter<TInput = unknown, TOutput = unknown> {
  convert(data: TInput): TOutput;
}

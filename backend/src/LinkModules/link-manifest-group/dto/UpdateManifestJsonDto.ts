export class UpdateManifestJsonDto {
  manifestId?: number;

  // Accepted in place of `manifestId`, the name this DTO used to declare.
  id?: number;

  json: any;
}

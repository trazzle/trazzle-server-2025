import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

interface IsImageFileOptions {
  mimeTypes?: string[]; // 허용 mime type
  maxSizeMB?: number; // 최대 용량(MB)
}

export function IsImageFile(
  options: IsImageFileOptions = {},
  validationOptions?: ValidationOptions,
) {
  const { mimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], maxSizeMB = 10 } =
    options;
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsImageFile',
      target: object.constructor,
      propertyName,
      constraints: [mimeTypes, maxSizeMB],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true; // @IsOptional 처리
          // Multer File 형식인지
          if (typeof value !== 'object' || !('mimetype' in value) || !('size' in value)) {
            return false;
          }

          const [allowedMimeTypes, max] = args.constraints;
          if (!allowedMimeTypes.includes(value.mimetype)) return false;

          const maxBytes = max * 1024 * 1024;
          if (value.size > maxBytes) return false;
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const [allowedMimeTypes, max] = args.constraints;
          return `프로필 이미지는 (${allowedMimeTypes.join(', ')}) 형식이며 ${max}MB 이하만 가능합니다.`;
        },
      },
    });
  };
}

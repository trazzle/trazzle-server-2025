import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';

interface ISwaggerApiPropertiesDescriptionOptions {
  dto: new () => unknown;
  description?: string;
}

export function SwaggerApiPropertiesDescription(options: ISwaggerApiPropertiesDescriptionOptions) {
  const { dto, description } = options;
  const schemas =
    Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES_ARRAY, dto.prototype as object) || [];

  const propertyDescriptions = schemas
    .map((schema: string) => {
      const propertyName = schema.slice(1);
      const metadata = Reflect.getMetadata(
        DECORATORS.API_MODEL_PROPERTIES,
        dto.prototype as object,
        propertyName,
      );

      if (!metadata?.description) return null;

      // 타입 정보 추출 로직 수정
      let type = '';
      if (metadata.enum) {
        type = `enum(${metadata.enum.join('|')}`;
      } else if (metadata.isArray) {
        // 배열 요소의 타입 확인
        type = 'list';
      } else if (metadata.type) {
        // 새성자 함수의 이름을 소문자로 변환
        type = metadata.type.name.toLowerCase();
      }

      return `\`${propertyName}\`(\`${type}\`): ${metadata.description}\n`;
    })
    .filter(Boolean)
    .join('\n');

  return applyDecorators(
    ApiOperation({
      description: description
        ? `${description}\n\n---\n\n${propertyDescriptions}`
        : propertyDescriptions,
    }),
  );
}

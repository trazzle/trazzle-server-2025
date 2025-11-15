import toSnakeCase from './to-snake-case';

describe('toSnakeCase', () => {
  it('단일단어 Jordan을 jordan 으로 변환 성공한다', () => {
    // given
    const input = 'Jordan';
    const expectedSnakeCase = 'jordan';

    // when
    const result = toSnakeCase(input);

    // then
    expect(result).toBe(expectedSnakeCase);
  });
  it('화이트 스페이스로 구분된 여러음절 단어 United States of America 를 united_states_of_america 으로 변환 성공한다', () => {
    // given
    const input = 'United States of America';
    const expectedSnakeCase = 'united_states_of_america';

    // when
    const result = toSnakeCase(input);

    // then
    expect(result).toBe(expectedSnakeCase);
  });
  it('- 가 포함된 단어 Guinea-Bissau 를 guinea-bissau 으로 변환 성공한다', () => {
    // given
    const input = 'Guinea-Bissau';
    const expectedSnakeCase = 'guinea-bissau';

    // when
    const result = toSnakeCase(input);

    // then
    expect(result).toBe(expectedSnakeCase);
  });
  it("' 가 포함된 단어 Cote D'Ivoire 를 cote_d'ivoire 으로 변환 성공한다", () => {
    // given
    const input = "Cote D'Ivoire";
    const expectedSnakeCase = "cote_d'ivoire";

    // when
    const result = toSnakeCase(input);

    // then
    expect(result).toBe(expectedSnakeCase);
  });
});

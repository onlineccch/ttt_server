/**
 *
 * Generate 5 Characters Room Id
 *
 * @returns string
 */
export const generate_room = () => {
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += String.fromCharCode(97 + Math.floor(Math.random() * 26));
  }

  return result;
};

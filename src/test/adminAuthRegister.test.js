import { adminAuthRegister } from "../testWrappers"
import { clear } from "../other"

describe('adminAuthRegister', () => {
  beforeEach(() => {
    clear()
  })
  test('ERROR: Email address is used by another user', () => {
    adminAuthRegister("nguyenluongthang33@gmail.com", 'ltngu0105', 'Thang', 'Nguyen')
    let error = adminAuthRegister("nguyenluongthang33@gmail.com", 'ltngu2705', 'Thang', 'Ngu')

    expect(error.statusCode).toStrictEqual(400)
    expect(error.content).toStrictEqual({error: 'Email address used by another user'})

    let res = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Thang', 'Ngu')
    let user1 = res.content
    expect(res.statusCode).toStrictEqual(200)
    expect(user1).toStrictEqual({token: expect.any(String)})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu2705', 'Thang', 'Ngu')
    
    expect(error.statusCode).toStrictEqual(400)
    expect(error.content).toStrictEqual({error: 'Email address used by another user'})
  })

  test('ERROR: Invalid email', () => {
    let error = adminAuthRegister("nguyenluongthang33@com", 'ltngu2705', 'Thang', 'Ngu')
    
    expect(error.statusCode).toStrictEqual(400)
    expect(error.content).toStrictEqual({error: 'Invalid email address'})

    let res = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Thang', 'Ngu')
    expect(res.statusCode).toBe(200)
    expect(res.content).toStrictEqual({ token: expect.any(String)})

    error = adminAuthRegister("lt@05", 'ltngu2705', 'Thang', 'Ngu')
    expect(error.statusCode).toStrictEqual(400)
    expect(error.content).toStrictEqual({error: 'Invalid email address'})

    res = adminAuthRegister("lt@gmail.com", 'ltngu2705', 'Thang', 'Ngu')
    expect(res.statusCode).toStrictEqual(200)
    expect(res.content).toStrictEqual({ token: expect.any(String) })
  })

  test.each([
    {email: 'lt05@gmail.com', password: 'ltngu0105', nameFirst: 'Thang@', nameLast: 'Ngu'},
    {email: 'lt05@gmail.com', password: 'ltngu0105', nameFirst: 'Thang123', nameLast: 'Ngu'},
    {email: 'lt05@gmail.com', password: 'ltngu0105', nameFirst: 'Thang?', nameLast: 'Ngu'},
    {email: 'lt05@gmail.com', password: 'ltngu0105', nameFirst: 'Thang.', nameLast: 'Ngu'},
    {email: 'lt05@gmail.com', password: 'ltngu0105', nameFirst: '1234Thang+', nameLast: 'Ngu'},
    {email: 'lt05@gmail.com', password: 'ltngu0105', nameFirst: 'Thang=', nameLast: 'Ngu'},
    {email: 'lt05@gmail.com', password: 'ltngu0105', nameFirst: '123Thang?', nameLast: 'Ngu'},
    {email: 'lt05@gmail.com', password: 'ltngu0105', nameFirst: '123345', nameLast: 'Ngu'},
  ])('ERROR: NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes', ({email, password, nameFirst, nameLast}) => {
    let error = adminAuthRegister(email, password, nameFirst, nameLast)
    expect(error).toStrictEqual({statusCode: 400, content: {error: 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'}})
  })

  test.each([
    {email: 'lt05@gmail.com', password: 'ltngu0105', nameLast: 'Thang@', nameFirst: 'Ngu'},
    {email: 'lt05@gmail.com', password: 'ltngu0105', nameLast: 'Thang123', nameFirst: 'Ngu'},
    {email: 'lt05@gmail.com', password: 'ltngu0105', nameLast: 'Thang?', nameFirst: 'Ngu'},
    {email: 'lt05@gmail.com', password: 'ltngu0105', nameLast: 'Thang.', nameFirst: 'Ngu'},
    {email: 'lt05@gmail.com', password: 'ltngu0105', nameLast: '1234Thang+', nameFirst: 'Ngu'},
    {email: 'lt05@gmail.com', password: 'ltngu0105', nameLast: 'Thang=', nameFirst: 'Ngu'},
    {email: 'lt05@gmail.com', password: 'ltngu0105', nameLast: '123Thang?', nameFirst: 'Ngu'},
    {email: 'lt05@gmail.com', password: 'ltngu0105', nameLast: '123345', nameFirst: 'Ngu'},
  ])('ERROR: NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes', ({email, password, nameLast, nameFirst}) => {
    let error = adminAuthRegister(email, password, nameFirst, nameLast)
    expect(error).toStrictEqual({statusCode: 400, content: {error : "Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes"}})
  })

  test.each([
    {email: "lt05@gmail.com", password: 'ltngu0105', nameFirst: "ttttttttttttttttttttt", nameLast: 'Ngu'},
    {email: "lt05@gmail.com", password: 'ltngu0105', nameFirst: "", nameLast: 'Ngu'},
    {email: "lt05@gmail.com", password: 'ltngu0105', nameFirst: " ", nameLast: 'Ngu'},
    {email: "lt05@gmail.com", password: 'ltngu0105', nameFirst: "T", nameLast: 'Ngu'},
  ])('ERROR: NameFirst is less than 2 characters or more than 20 characters', ({email, password, nameFirst, nameLast}) => {
    let error = adminAuthRegister(email, password, nameFirst, nameLast)
    expect(error).toStrictEqual({statusCode: 400, content: {error : "First name length must be between 2 and 20 characters"}})
  })

  test.each([
    {email: "lt05@gmail.com", password: 'ltngu0105', nameLast: "ttttttttttttttttttttt", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: 'ltngu0105', nameLast: "", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: 'ltngu0105', nameLast: " ", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: 'ltngu0105', nameLast: "T", nameFirst: 'Ngu'},
  ])('ERROR: NameLast is less than 2 characters or more than 20 characters', ({email, password, nameFirst, nameLast}) => {
    let error = adminAuthRegister(email, password, nameFirst, nameLast)
    expect(error).toStrictEqual({statusCode: 400, content: {error: "Last name length must be between 2 and 20 characters"}})
  })

  test.each([
    {email: "lt05@gmail.com", password: 'abcde12', nameLast: "Thang", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: 'a1', nameLast: "Thang", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: 'a', nameLast: "Thang", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: '       ', nameLast: "Thang", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: '', nameLast: "Thang", nameFirst: 'Ngu'},
  ])('ERROR: Password is less than 8 characters', ({email, password, nameFirst, nameLast}) => {
    let error = adminAuthRegister(email, password, nameFirst, nameLast)
    expect(error).toStrictEqual({statusCode: 400, content: {error: "Password must have at least 8 characters"}})
  })

  test.each([
    {email: "lt05@gmail.com", password: '12345678', nameLast: "Thang", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: 'abcdefgh', nameLast: "Thang", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: '++++@@@@****', nameLast: "Thang", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: 'aaaaaaaaa+./,@', nameLast: "Thang", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: '        ', nameLast: "Thang", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: '        1', nameLast: "Thang", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: 'aaaaaaaa', nameLast: "Thang", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: '       a', nameLast: "Thang", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: '       abcdef', nameLast: "Thang", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: '        ?+', nameLast: "Thang", nameFirst: 'Ngu'},
    {email: "lt05@gmail.com", password: '        123321', nameLast: "Thang", nameFirst: 'Ngu'},
  ])('ERROR: Password does not contain at least one number and at least one letter', ({email, password, nameFirst, nameLast}) => {
    let error = adminAuthRegister(email, password, nameFirst, nameLast)
    expect(error).toStrictEqual({statusCode: 400, content: {error: "Password must contain at least one number and at least one letter"}})
  })

  test.each([
    // valid passwords
    { email: 'lt07@gmail.com', password: '123456abc', nameFirst: 'Thang', nameLast: 'ngu' },
    { email: 'lt07@gmail.com', password: '+./?123abcde', nameFirst: 'Thang', nameLast: 'ngu' },
    { email: 'lt07@gmail.com', password: '       123a', nameFirst: 'Thang', nameLast: 'ngu' },
    { email: 'lt07@gmail.com', password: 'luongthang0105', nameFirst: 'Thang', nameLast: 'ngu' },
    
    // passwords with valid length
    { email: 'lt07@gmail.com', password: 'abcddcb1', nameFirst: 'Thang', nameLast: 'ngu' },
    { email: 'lt07@gmail.com', password: '1234567aaaa', nameFirst: 'Thang', nameLast: 'ngu' },
    { email: 'lt07@gmail.com', password: '        1a', nameFirst: 'Thang', nameLast: 'ngu' },

    // last names with valid length
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameFirst: 'Ngu', nameLast: 'Th' },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameFirst: 'Ngu', nameLast: 'tttttttttttttttttttt' },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameFirst: 'Ngu', nameLast: '  ' },

    // valid last names
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameFirst: 'Ngu', nameLast: 'Thang' },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameFirst: 'Ngu', nameLast: 'thang' },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameFirst: 'Ngu', nameLast: 'luong thang' },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameFirst: 'Ngu', nameLast: 'LUONG THANG' },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameFirst: 'Ngu', nameLast: 'LUONG-THANG' },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameFirst: 'Ngu', nameLast: "O'Brien" },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameFirst: 'Ngu', nameLast: "'''''" },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameFirst: 'Ngu', nameLast: "-----" },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameFirst: 'Ngu', nameLast: "    " },

    // first names with valid length
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: 'Th' },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: 'tttttttttttttttttttt' },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: '  ' },

    // valid first names
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: 'Thang' },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: 'thang' },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: 'luong thang' },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: 'LUONG THANG' },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: 'LUONG-THANG' },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: "LUONGTHANG" },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: "LUONG ' THANG" },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: "LUONG'THANG" },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: "LUONG'-THANG" },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: "O'Brien" },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: "'''''" },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: "-----" },
    { email: 'lt07@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: "    " },

    // valid emails
    { email: 'lt@gmail.com', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: "'''''" },
    { email: 'apcs@gmail.vn', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: "-----" },
    { email: 'thomas@ad.unsw.edu.au', password: 'ltngu0105', nameLast: 'Ngu', nameFirst: "    " },
  ])('SUCESS', ({ email, password, nameFirst, nameLast }) => {
    let res = adminAuthRegister(email, password, nameFirst, nameLast)
    expect(res.content).toStrictEqual({token: expect.any(String)})
    expect(res.statusCode).toStrictEqual(200)
  })
})

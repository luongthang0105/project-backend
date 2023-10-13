import { adminAuthRegister } from "../auth.js"
import { clear } from "../other.js"

describe('adminAuthRegister', () => {
  beforeEach(() => {
    clear()
  })
  test('ERROR: Email address is used by another user', () => {
    adminAuthRegister("nguyenluongthang33@gmail.com", 'ltngu0105', 'Thang', 'Nguyen')
    let error = adminAuthRegister("nguyenluongthang33@gmail.com", 'ltngu2705', 'Thang', 'Ngu')
    expect(error).toEqual({error: 'Email address used by another user'})

    let authUserId = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Thang', 'Ngu')
    expect(authUserId).toEqual({ authUserId: expect.any(Number)})
    error = adminAuthRegister("lt05@gmail.com", 'ltngu2705', 'Thang', 'Ngu')
    expect(error).toEqual({error: 'Email address used by another user'})
  })

  test('ERROR: Invalid email', () => {
    let error = adminAuthRegister("nguyenluongthang33@com", 'ltngu2705', 'Thang', 'Ngu')
    expect(error).toEqual({error: 'Invalid email address'})

    let authUserId = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Thang', 'Ngu')
    expect(authUserId).toEqual({ authUserId: expect.any(Number)})

    error = adminAuthRegister("lt@05", 'ltngu2705', 'Thang', 'Ngu')
    expect(error).toEqual({error: 'Invalid email address'})

    authUserId = adminAuthRegister("lt@gmail.com", 'ltngu2705', 'Thang', 'Ngu')
    expect(authUserId).toEqual({ authUserId: expect.any(Number)})
  })

  test('ERROR: NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes', () => {
    let error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Thang@', 'Ngu')
    expect(error).toEqual({error: 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Thang123', 'Ngu')
    expect(error).toEqual({error: 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Thang?', 'Ngu')
    expect(error).toEqual({error: 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Thang.', 'Ngu')
    expect(error).toEqual({error: 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', '1234Thang+', 'Ngu')
    expect(error).toEqual({error: 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Thang=', 'Ngu')
    expect(error).toEqual({error: 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', '123Thang?', 'Ngu')
    expect(error).toEqual({error: 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', '123345', 'Ngu')
    expect(error).toEqual({error: 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'})

  })

  test('ERROR: NameFirst is less than 2 characters or more than 20 characters', () => {
    let error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', "T", 'Ngu')
    expect(error).toEqual({error : "First name length must be between 2 and 20 characters"})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', "ttttttttttttttttttttt", 'Ngu')
    expect(error).toEqual({error : "First name length must be between 2 and 20 characters"})		

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', "", 'Ngu')
    expect(error).toEqual({error : "First name length must be between 2 and 20 characters"})		

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', " ", 'Ngu')
    expect(error).toEqual({error : "First name length must be between 2 and 20 characters"}) 
  })
  test('ERROR: NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes', () => {
    let error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Ngu', 'Thang@')
    expect(error).toEqual({error: 'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Ngu', 'Thang123')
    expect(error).toEqual({error: 'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Ngu', 'Thang?')
    expect(error).toEqual({error: 'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Ngu', 'Thang.')
    expect(error).toEqual({error: 'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Ngu', 'Thang+')
    expect(error).toEqual({error: 'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Ngu', 'Thang=')
    expect(error).toEqual({error: 'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Ngu', '123Thang?')
    expect(error).toEqual({error: 'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Ngu', '123345')
    expect(error).toEqual({error: 'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes'})
  })
  test('ERROR: NameLast is less than 2 characters or more than 20 characters', () => {
    let error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', "Ngu", 'T')
    expect(error).toEqual({error : "Last name length must be between 2 and 20 characters"})

    error = adminAuthRegister("lt05@gmail.com", 'ltngu0105', 'Ngu', "ttttttttttttttttttttt")
    expect(error).toEqual({error : "Last name length must be between 2 and 20 characters"})
  })

  test('ERROR: Password is less than 8 characters', () => {
    let error = adminAuthRegister('lt05@gmail.com', 'abcde12', 'Thang', 'Ngu')
    expect(error).toEqual({error : "Password must have at least 8 characters"})

    error = adminAuthRegister('lt05@gmail.com', 'a1', 'Thang', 'Ngu')
    expect(error).toEqual({error : "Password must have at least 8 characters"})
    
    error = adminAuthRegister('lt05@gmail.com', 'a', 'Thang', 'Ngu')
    expect(error).toEqual({error : "Password must have at least 8 characters"})
    
    error = adminAuthRegister('lt05@gmail.com', '', 'Thang', 'Ngu')
    expect(error).toEqual({error : "Password must have at least 8 characters"})
    
    error = adminAuthRegister('lt05@gmail.com', '       ', 'Thang', 'Ngu')
    expect(error).toEqual({error : "Password must have at least 8 characters"})
  })
  test('ERROR: Password does not contain at least one number and at least one letter', () => {
    let error = adminAuthRegister('lt05@gmail.com', '12345678', 'Thang', 'ngu')
    expect(error).toEqual({error: 'Password must contain at least one number and at least one letter'})

    error = adminAuthRegister('lt05@gmail.com', 'abcdefgh', 'Thang', 'ngu')
    expect(error).toEqual({error: 'Password must contain at least one number and at least one letter'})
    
    error = adminAuthRegister('lt05@gmail.com', '++++@@@@****', 'Thang', 'ngu')
    expect(error).toEqual({error: 'Password must contain at least one number and at least one letter'})
    
    error = adminAuthRegister('lt05@gmail.com', 'aaaaaaaaa+./,@', 'Thang', 'ngu')
    expect(error).toEqual({error: 'Password must contain at least one number and at least one letter'})
    
    error = adminAuthRegister('lt05@gmail.com', '        ', 'Thang', 'ngu')
    expect(error).toEqual({error: 'Password must contain at least one number and at least one letter'})
    
    error = adminAuthRegister('lt05@gmail.com', '        1', 'Thang', 'ngu')
    expect(error).toEqual({error: 'Password must contain at least one number and at least one letter'})
    
    error = adminAuthRegister('lt05@gmail.com', 'aaaaaaaa', 'Thang', 'ngu')
    expect(error).toEqual({error: 'Password must contain at least one number and at least one letter'})
    
    error = adminAuthRegister('lt05@gmail.com', '       a', 'Thang', 'ngu')
    expect(error).toEqual({error: 'Password must contain at least one number and at least one letter'})
    
    error = adminAuthRegister('lt05@gmail.com', '       abcdef', 'Thang', 'ngu')
    expect(error).toEqual({error: 'Password must contain at least one number and at least one letter'})
    
    error = adminAuthRegister('lt05@gmail.com', '        ?+', 'Thang', 'ngu')
    expect(error).toEqual({error: 'Password must contain at least one number and at least one letter'})
    
    error = adminAuthRegister('lt05@gmail.com', '        123321', 'Thang', 'ngu')
    expect(error).toEqual({error: 'Password must contain at least one number and at least one letter'})
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
    expect(adminAuthRegister(email, password, nameFirst, nameLast).authUserId).toEqual(expect.any(Number))
  })
})

import {
  clear,
  adminAuthLogin,
  adminAuthRegister,
  adminUserDetails,
  adminQuizCreate,
  adminQuizDescriptionUpdate,
  adminQuizInfo,
  adminQuizList,
  adminQuizNameUpdate,
  adminQuizRemove,
} from '../testWrappers';

describe('Test on all admin functions', () => {
  beforeEach(() => {
    clear();
  });

  test('Success', () => {
    const user01 = adminAuthRegister(
      'ltngu05@gmail.com',
      'ltngu2705',
      'Thang',
      'Ngu'
    ).content;
    const user02 = adminAuthRegister(
      'ltngu06@gmail.com',
      'ltngu2705',
      'Thang',
      'Ko Ngu'
    ).content;
    const user03 = adminAuthRegister(
      'ltngu07@gmail.com',
      'ltngu2705',
      'Han',
      'Hanh'
    ).content;

    // user01 log in okay
    expect(adminAuthLogin('ltngu05@gmail.com', 'ltngu2705').content).toStrictEqual({
      token: expect.any(String),
    });

    // user01 failed 1 time
    expect(adminAuthLogin('ltngu05@gmail.com', 'ltngu27056').content).toStrictEqual({
      error: expect.any(String),
    });
    expect(
      adminUserDetails(user01).content.user.numSuccessfulLogins
    ).toStrictEqual(2);
    expect(
      adminUserDetails(user01).content.user.numFailedPasswordsSinceLastLogin
    ).toStrictEqual(1);

    expect(adminAuthLogin('ltngu05@gmail.com', 'ltngu2705').content).toStrictEqual({
      token: expect.any(String),
    });

    expect(
      adminUserDetails(user01).content.user.numSuccessfulLogins
    ).toStrictEqual(3);
    expect(
      adminUserDetails(user01).content.user.numFailedPasswordsSinceLastLogin
    ).toStrictEqual(0);

    const quiz01 = adminQuizCreate(user01, 'Quiz 01', 'Des 1').content;
    const quiz02 = adminQuizCreate(user02, 'Quiz 02', 'Des 2').content;
    const quiz03 = adminQuizCreate(user03, 'Quiz 03', 'Des 3').content;

    const quiz04 = adminQuizCreate(user01, 'Quiz 04', 'Des 4').content;
    const quiz05 = adminQuizCreate(user02, 'Quiz 05', 'Des 5').content;
    const quiz06 = adminQuizCreate(user03, 'Quiz 06', 'Des 6').content;

    let quizList1 = adminQuizList(user01).content;
    expect(quizList1.quizzes.length).toStrictEqual(2);
    expect(quizList1.quizzes).toStrictEqual([
      {
        quizId: quiz01.quizId,
        name: 'Quiz 01',
      },
      {
        quizId: quiz04.quizId,
        name: 'Quiz 04',
      },
    ]);
    let quizList2 = adminQuizList(user02).content;
    expect(quizList2.quizzes.length).toStrictEqual(2);
    expect(quizList2.quizzes).toStrictEqual([
      {
        quizId: quiz02.quizId,
        name: 'Quiz 02',
      },
      {
        quizId: quiz05.quizId,
        name: 'Quiz 05',
      },
    ]);

    let quizList3 = adminQuizList(user03).content;
    expect(quizList3.quizzes.length).toStrictEqual(2);
    expect(quizList3.quizzes).toStrictEqual([
      {
        quizId: quiz03.quizId,
        name: 'Quiz 03',
      },
      {
        quizId: quiz06.quizId,
        name: 'Quiz 06',
      },
    ]);

    expect(adminQuizRemove(user01, quiz04.quizId).content).toStrictEqual({});
    expect(adminQuizRemove(user01, quiz01.quizId).content).toStrictEqual({});

    expect(adminQuizRemove(user02, quiz02.quizId).content).toStrictEqual({});
    expect(adminQuizRemove(user03, quiz06.quizId).content).toStrictEqual({});

    quizList1 = adminQuizList(user01).content;
    expect(quizList1.quizzes.length).toStrictEqual(0);
    expect(quizList1.quizzes).toStrictEqual([]);

    quizList2 = adminQuizList(user02).content;
    expect(quizList2.quizzes.length).toStrictEqual(1);
    expect(quizList2.quizzes).toStrictEqual([
      {
        quizId: quiz05.quizId,
        name: 'Quiz 05',
      },
    ]);

    quizList3 = adminQuizList(user03).content;
    expect(quizList3.quizzes.length).toStrictEqual(1);
    expect(quizList3.quizzes).toStrictEqual([
      {
        quizId: quiz03.quizId,
        name: 'Quiz 03',
      },
    ]);

    // Change quiz05 name to quiz03
    expect(
      adminQuizNameUpdate(user02, quiz05.quizId, 'Quiz 03').content
    ).toStrictEqual({});
    // Change quiz03 name to quiz05
    expect(
      adminQuizNameUpdate(user03, quiz03.quizId, 'Quiz 05').content
    ).toStrictEqual({});

    expect(adminQuizInfo(user02, quiz05.quizId).content.name).toStrictEqual(
      'Quiz 03'
    );
    expect(adminQuizInfo(user03, quiz03.quizId).content.name).toStrictEqual(
      'Quiz 05'
    );

    // Change quiz05 des to Des 555
    expect(
      adminQuizDescriptionUpdate(user02, quiz05.quizId, 'Des 555').content
    ).toStrictEqual({});
    // Change quiz05 des to Des 333
    expect(
      adminQuizDescriptionUpdate(user03, quiz03.quizId, 'Des 333').content
    ).toStrictEqual({});

    expect(
      adminQuizInfo(user02, quiz05.quizId).content.description
    ).toStrictEqual('Des 555');
    expect(
      adminQuizInfo(user03, quiz03.quizId).content.description
    ).toStrictEqual('Des 333');
  });
});

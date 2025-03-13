import chai from "chai";
import chaiHttp from "chai-http";
import app from "../src/app";
import { sequelize } from "../src/configs/db";
import { IdentifyReqResData } from "../src/interfaces";

chai.use(chaiHttp);
const { expect } = chai;

// Test data for identify request and response
const identifyReqResData: IdentifyReqResData = {
    1: {
        request: {
            email: 'a1-example@email.com',
            phoneNumber: 1111111111
        },
        response: {
            status: 200,
            body: {
                success: true,
                contact: {
                    primaryContactId: 1,
                    emails: ['a1-example@email.com'],
                    phoneNumbers: ['1111111111'],
                    secondaryContactIds: []
                }
            }
        }
    },
    2: {
        request: {
            email: 'a1-example@email.com',
            phoneNumber: 2222222222
        },
        response: {
            status: 200,
            body: {
                success: true,
                contact: {
                    primaryContactId: 1,
                    emails: ['a1-example@email.com'],
                    phoneNumbers: ['1111111111', '2222222222'],
                    secondaryContactIds: [2]
                }
            }
        }
    },
    3: {
        request: {
            email: 'd1-example@email.com',
            phoneNumber: 3333333333
        },
        response: {
            status: 200,
            body: {
                success: true,
                contact: {
                    primaryContactId: 3,
                    emails: ['d1-example@email.com'],
                    phoneNumbers: ['3333333333'],
                    secondaryContactIds: []
                }
            }
        }
    },
    4: {
        request: {
            email: 'd2-example@email.com',
            phoneNumber: 3333333333
        },
        response: {
            status: 200,
            body: {
                success: true,
                contact: {
                    primaryContactId: 3,
                    emails: ['d1-example@email.com', 'd2-example@email.com'],
                    phoneNumbers: ['3333333333'],
                    secondaryContactIds: [4]
                }
            }
        }
    },
    5: {
        request: {
            email: 'd2-example@email.com',
            phoneNumber: 4444444444
        },
        response: {
            status: 200,
            body: {
                success: true,
                contact: {
                    primaryContactId: 3,
                    emails: ['d1-example@email.com', 'd2-example@email.com'],
                    phoneNumbers: ['3333333333', '4444444444'],
                    secondaryContactIds: [4, 5]
                }
            }
        }
    },
    6: {
        request: {
            email: 'a1-example@email.com',
            phoneNumber: 3333333333
        },
        response: {
            status: 200,
            body: {
                success: true,
                contact: {
                    primaryContactId: 1,
                    emails: ['a1-example@email.com', 'd1-example@email.com', 'd2-example@email.com'],
                    phoneNumbers: ['1111111111', '2222222222', '3333333333', '4444444444'],
                    secondaryContactIds: [2, 3, 4, 5]
                }
            }
        }
    },
    7: {
        request: {
            email: 'a1-example@email.com',
            phoneNumber: 5555555555
        },
        response: {
            status: 200,
            body: {
                success: true,
                contact: {
                    primaryContactId: 1,
                    emails: ['a1-example@email.com', 'd1-example@email.com', 'd2-example@email.com'],
                    phoneNumbers: ['1111111111', '2222222222', '3333333333', '4444444444', '5555555555'],
                    secondaryContactIds: [2, 3, 4, 5, 6]
                }
            }
        }
    },
    8: {
        request: {
            email: 'c1-example@email.com',
            phoneNumber: null
        },
        response: {
            status: 200,
            body: {
                success: true,
                contact: {
                    primaryContactId: 7,
                    emails: ['c1-example@email.com'],
                    phoneNumbers: [],
                    secondaryContactIds: []
                }
            }
        }
    },
    9: {
        request: {
            email: null,
            phoneNumber: 9999999999
        },
        response: {
            status: 200,
            body: {
                success: true,
                contact: {
                    primaryContactId: 8,
                    emails: [],
                    phoneNumbers: ['9999999999'],
                    secondaryContactIds: []
                }
            }
        }
    }
}

describe('POST /api/v1/identify', () => {
    // Before running tests, reset the database
    before(async () => {
        await sequelize.sync({ force: true });
    });

    // After running tests, close the database
    after(async () => {
        await sequelize.drop()
        await sequelize.close();
    });

    it('Invalid input, Both email and phoneNumber fields are null', (done) => {
        chai.request(app)
            .post('/api/v1/identify')
            .send({ email: null, phoneNumber: null })
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(400);
                done();
            });
    });
       
    it('Only single valid input, phoneNumber field with wrong data type', (done) => {
        chai.request(app)
            .post('/api/v1/identify')
            .send({ email: null, phoneNumber: "11111" })
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(400);
                done();
            });
    });
  
    for (const property in identifyReqResData) {
        it(`API Request and Response: Email and phoneNumber are ${identifyReqResData[property].request.email} and ${identifyReqResData[property].request.phoneNumber}`, (done) => {
            chai.request(app)
                .post('/api/v1/identify')
                .send(identifyReqResData[property].request)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res).to.have.status(identifyReqResData[property].response.status);
                    expect(res.body).to.deep.equal(identifyReqResData[property].response.body);
                    done();
                });
        });
    }
});


export {};
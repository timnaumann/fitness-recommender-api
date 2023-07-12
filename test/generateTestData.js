import axios from 'axios'
import dotenv from 'dotenv'

/* eslint-disable */

dotenv.config()

const instance = axios.create({
    baseURL: `http://${process.env.HOST}:${process.env.PORT}/${process.env.ENTITY_URL_PREFIX}`,
    timeout: 5000
})

instance.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${process.env.TECHNICAL_USER_TOKEN}`
    return config
})

const diagnosisEndpoint = '/diagnosis'
const createExampleDiagnosis = async (locale) => {
    const sendPostToDiagnosisEndpoint = (params) => sendPost(params, diagnosisEndpoint)
    await sendPostToDiagnosisEndpoint({
        name: 'impingement-syndrom',
        description: 'Bodybuilderschulter bzw. alle möglichen Formen des Impingment-SyndromsAls Impingement-Syndrom (Schulter-Engpass-Syndrom) bezeichnet man ein Krankheitsbild, bei dem Bewegungen des Armes über Kopfhöhe extreme Schmerzen auslösen. Schuld daran ist zum einen oft eine Schwellung oder Verkalkung des Schleimbeutels. Zudem ragt häufig ein Knochensporn unter das Schulterdach, wodurch die Bewegungsfreiheit des Oberarmkopfes und der umgebenden Muskeln unter dem Schulterdach zusätzlich eingeschränkt wird und Einklemmungsschmerzen verursacht werden. Bleibt das Impingment-Syndrom unbehandelt, kann dies nach dauerhaften Schädigungen zu einer Versteifung der Schulter führen. Falls durch konservative Therapie-Maßnahmen kein dauerhaft schmerzfreier Zustand erreicht werden kann, kann eine operative (endoskopische) Schleimbeutelentfernung mit Abschleifen der unteren Knochenkante des Schulterdachs zu einer schnellen Beschwerdebesserung führen',
        categoryName: 'shoulder',
        locale
    })

    return sendPostToDiagnosisEndpoint({
        name: 'kalkschulter',
        description: 'Neben dem reinen Impingement-Syndrom kann eine Arthrose des Schultereckgelenks (AC-Gelenk) eine weitere Ursache für Schulterschmerzen sein. Das Schultereckgelenk wird aus dem Schulterdach und dem seitlichen Ende des Schlüsselbeins gebildet. Bei massivem Verschleiß dieser Gelenke kommt es zum Reibungsschmerzen der frei liegenden Knochenflächen. Nach Ausschöpfen der konservativen Therapiemaßnahmen kann mit einer operativen (minimalinvasiven) Entfernung des seitlichen Schlüsselbeinendes eine rasche Beschwerdebesserung erzielt werden.',
        categoryName: 'shoulder',
        locale
    })
}
const categoryTestEndpoint = '/categories'
const createExampleCategories = async (locale) => {
    const sendPostToCategoryTestEndpoint = (params) => sendPost(params, categoryTestEndpoint)

    await sendPostToCategoryTestEndpoint({
        name: 'shoulder',
        label: 'Shoulder',
        description: 'Da dieses Gelenk vor allem durch Muskulatur gesichert ist und die Bewegungen kaum durch knöcherne' +
            'Strukturen eingeschränkt werden, ist es das beweglichste Kugelgelenk des menschlichen Körpers. Dadurch sind ' +
            'aber Ausrenkungen (Luxationen) der Schulter relativ häufig, ebenso wie Muskel- und Sehnenrisse im Bereich der ' +
            'Rotatorenmanschette.',
        sourceUrl: 'https://service.mindyourposture.ai/images/shoulder.webp',
        locale
    })

    await sendPostToCategoryTestEndpoint({
        name: 'knee',
        label: 'Knee',
        description: 'Das Kniegelenk ist ein zusammengesetztes Gelenk. Es besteht aus zwei Einzelgelenken, dem ' +
            'Kniescheibengelenk (Articulatio femoropatellaris), welches sich zwischen Oberschenkelknochen und Kniescheibe ' +
            'befindet, und dem Kniekehlgelenk (Articulatio femorotibialis), das zwischen Oberschenkelknochen und ' +
            'Schienbeinkopf (Caput tibiae) liegt.',
        sourceUrl: 'https://service.mindyourposture.ai/images/shoulder.webp',
        locale
    })
}

const stagesEndpoint = '/question-stages'
const createExampleStages = async (locale) => {
    const sendPostToStagesEndpoint = (params) => sendPost(params, stagesEndpoint)
    await sendPostToStagesEndpoint({
        name: 'first',
        questionFlowPosition: 0,
        heading: 'Wir benötigen weitere Informationen',
        locale
    })

    await sendPostToStagesEndpoint({
        name: 'second',
        questionFlowPosition: 1,
        heading: 'Wir benötigen weitere Informationen (second stage)',
        locale
    })

    await sendPostToStagesEndpoint({
        name: 'third',
        questionFlowPosition: 2,
        heading: '(third) Folge bitte den Anweisungen',
        locale
    })

    await sendPostToStagesEndpoint({
        name: 'forth',
        questionFlowPosition: 3,
        heading: '(forth) Folge bitte den Anweisungen',
        locale
    })
}

const questionsTestEndpoint = '/questions'
const createExampleQuestion = async (locale) => {
    const sendPostToQuestionTestEndpoint = (params) => sendPost(params, questionsTestEndpoint)
    const assignQuestionToCategory = (categoryId, questionId) => sendPost({},
        `categories/${categoryId}/questions/${questionId}`
    )

    await sendPostToQuestionTestEndpoint({
        name: 'age',
        label: 'Wie alt bist du?',
        questionFlowPosition: 0,
        stageName: 'first',
        locale
    })
    await assignQuestionToCategory(1, 5)
    await assignQuestionToCategory(2, 5)

    await sendPostToQuestionTestEndpoint({
        name: 'activity',
        label: 'Wie aktiv bist du?',
        questionFlowPosition: 1,
        stageName: 'first',
        locale
    })
    await assignQuestionToCategory(1, 6)
    await assignQuestionToCategory(2, 6)

    await sendPostToQuestionTestEndpoint({
        name: 'diagnosis-decision',
        label: 'Hast du bereits eine Diagnose?',
        questionFlowPosition: 0,
        stageName: 'second',
        widgetType: 'boolQuestion',
        locale
    })

    await assignQuestionToCategory(1, 7)
    await assignQuestionToCategory(2, 7)

    // no assignment needed because they are already created during category creation
    await sendPostToQuestionTestEndpoint({
        name: 'diagnosis-review-shoulder',
        label: 'Krankheitsbild (Schulter) ',
        stageName: 'third',
        widgetType: 'reviewPanel',
        locale
    })

    await sendPostToQuestionTestEndpoint({
        name: 'diagnosis-review-knee',
        label: 'Krankheitsbild (Knie)',
        stageName: 'third',
        widgetType: 'reviewPanel',
        locale
    })

    await sendPostToQuestionTestEndpoint({
        name: 'diagnosis-tests-shoulder',
        label: '(Schulter) Ärzte führen folgende Untersuchungen und Tests durch um sich ein Bild über die Beschwerden zu machen.',
        stageName: 'forth',
        widgetType: 'panelWrapper',
        locale
    })

    await sendPostToQuestionTestEndpoint({
        name: 'diagnosis-tests-knee',
        label: '(Schulter) Ärzte führen folgende Untersuchungen und Tests durch um sich ein Bild über die Beschwerden zu machen.',
        stageName: 'forth',
        widgetType: 'panelWrapper',
        locale
    })
}

const answersEndpoint = '/answers'
const createExampleAnswers = async (locale) => {
    const sendPostToAnswersEndpoint = (params) => sendPost(params, answersEndpoint)

    await sendPostToAnswersEndpoint({
        questionName: 'age',
        label: 'unter 20',
        name: 'below20',
        locale
    })

    await sendPostToAnswersEndpoint({
        questionName: 'age',
        label: '20 - 34',
        name: '20-34',
        locale
    })

    await sendPostToAnswersEndpoint({
        questionName: 'age',
        label: '35 - 49',
        name: '35-49',
        locale
    })

    await sendPostToAnswersEndpoint({
        questionName: 'age',
        label: '50+',
        name: '50+',
        locale
    })

    await sendPostToAnswersEndpoint({
        name: 'beginner',
        questionName: 'activity',
        label: 'Beginner',
        sourceUrl: '/images/svg/sport.svg',
        locale
    })

    await sendPostToAnswersEndpoint({
        name: 'hobby',
        questionName: 'activity',
        label: 'Hobby',
        sourceUrl: '/images/svg/sport.svg',
        locale
    })

    await sendPostToAnswersEndpoint({
        name: 'professional',
        questionName: 'activity',
        label: 'Profi',
        sourceUrl: '/images/svg/sport.svg',
        locale
    })

    await sendPostToAnswersEndpoint({
        name: 'diagnosis-yes',
        questionName: 'diagnosis-decision',
        label: 'Ja',
        locale
    })

    await sendPostToAnswersEndpoint({
        name: 'diagnosis-no',
        questionName: 'diagnosis-decision',
        label: 'Nein',
        locale
    })

    await sendPostToAnswersEndpoint({
        name: 'impingement-review',
        questionName: 'diagnosis-review-shoulder',
        label: 'Impingement',
        description: 'Das Impingement-Syndrom (Engpass-Syndrom) beschreibt eine schmerzhafte Einklemmung von ' +
            'Sehnen oder Muskeln innerhalb eines Gelenks. Das kann zu schmerzhaften Bewegungseinschränkungen führen. ' +
            'Das Schultergelenk ist am häufigsten vom Impingement-Syndrom betroffen, gefolgt vom Hüftgelenk.',
        sourceUrl: 'https://www.youtube.com/embed/3euFeDglIBg',
        locale
    })

    await sendPostToAnswersEndpoint({
        name: 'kalkschulter-review',
        questionName: 'diagnosis-review-shoulder',
        label: 'Kalkschulter',
        description: 'Bei der Kalkschulter (lat. Tendinosis calcarea, auch: Tendinitis calcarea), bilden sich ' +
            'Kalkablagerungen in den Sehnen der Rotatorenmanschette, meistens in der Supraspinatussehne',
        sourceUrl: 'https://www.youtube.com/embed/Gk8cCEQh-CE',
        locale
    })

    await sendPostToAnswersEndpoint({
        name: 'hawkins',
        questionName: 'diagnosis-review-knee',
        label: 'Hawkins-Test',
        description: 'Der Hawkins-Test ist ein Test aus der Orthopädie, der im Rahmen der klinischen Untersuchung bei ' +
            'Schmerzen im Schultergelenk ein Impingement-Syndrom bestätigen oder ausschließen kann.',
        sourceUrl: 'https://www.youtube.com/embed/3euFeDglIBg',
        locale
    })

    await sendPostToAnswersEndpoint({
        name: 'hawkins',
        questionName: 'diagnosis-tests-shoulder',
        label: 'Hawkins-Test',
        description: 'Der Hawkins-Test ist ein Test aus der Orthopädie, der im Rahmen der klinischen Untersuchung bei ' +
            'Schmerzen im Schultergelenk ein Impingement-Syndrom bestätigen oder ausschließen kann.',
        sourceUrl: 'https://www.youtube.com/embed/Gk8cCEQh-CE',
        locale
    })

    await sendPostToAnswersEndpoint({
        name: 'ultrasonic',
        questionName: 'diagnosis-tests-shoulder',
        label: 'Ultraschalluntersuchung',
        description: 'Durch eine Ultraschalluntersuchung (Sonographie)(s. Abbildung) kann die Rotatorenmanschette ' +
            'dargstellt werden und hier das Kalkdepot lokalisiert werden. Außerdem kann das Ausmaß der meist begleitenden ' +
            'Schleimbeutelentzündung bestimmt werden.',
        sourceUrl: 'https://www.youtube.com/embed/3euFeDglIBg',
        locale
    })
}

const recommendationsEndpoint = '/recommendations'
const createExampleRecommendations = async (locale) => {
    const sendPostToRecommendationsEndpoint = (params) => sendPost(params, recommendationsEndpoint)

    await sendPostToRecommendationsEndpoint({
        name: 'Kalkschulter1',
        heading: 'Kalkschulter1',
        description: 'Kalkschulter: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, ' +
            'sed diam nonumy eirmod tempor invidunt ut labore et dolore magna ' +
            'aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo d' +
            'olores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet ',
        sourceUrl: 'https://www.youtube.com/embed/Gk8cCEQh-CE',
        tool: 'Matte',
        toolUrl: 'https://www.youtube.com/embed/3euFeDglIBg',
        diagnosisName: 'kalkschulter',
        locale
    })

    await sendPostToRecommendationsEndpoint({
        name: 'Kalkschulter2',
        heading: 'Kalkschulter2',
        description: 'Kalkschulter: a short description',
        sourceUrl: 'https://www.youtube.com/embed/3euFeDglIBg',
        diagnosisName: 'kalkschulter',
        locale
    })

    await sendPostToRecommendationsEndpoint({
        name: 'Kalkschulter3',
        heading: 'Kalkschulter3',
        description: 'Kalkschulter: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, ' +
            'sed diam nonumy eirmod tempor invidunt ut labore et dolore magna ' +
            'aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo d' +
            'olores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet ',
        sourceUrl: 'https://www.youtube.com/embed/ZyMZz6c0gs0',
        diagnosisName: 'kalkschulter',
        locale
    })

    await sendPostToRecommendationsEndpoint({
        name: 'Kalkschulter4',
        heading: 'Kalkschulter4',
        description: 'Kalkschulter: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, ' +
            'sed diam nonumy eirmod tempor invidunt ut labore et dolore magna ' +
            'aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo d' +
            'olores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet ',
        sourceUrl: 'https://www.youtube.com/embed/jDpKzlQX8CM',
        diagnosisName: 'kalkschulter',
        tool: 'Matte',
        toolUrl: 'https://www.youtube.com/embed/3euFeDglIBg',
        locale
    })

    await sendPostToRecommendationsEndpoint({
        name: 'Kalkschulter5',
        heading: 'Kalkschulter5',
        description: 'Kalkschulter: description',
        sourceUrl: 'http://localhost:3000/images/bild-kalkschulter.jpg',
        diagnosisName: 'kalkschulter',
        tool: 'Matte',
        toolUrl: 'https://www.youtube.com/embed/3euFeDglIBg',
        locale
    })

    await sendPostToRecommendationsEndpoint({
        name: 'Impigment Syndrom 1',
        heading: 'Impigment Syndrom 1',
        description: 'Impigment Syndrom: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, ' +
            'sed diam nonumy eirmod tempor invidunt ut labore et dolore magna ' +
            'aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo d' +
            'olores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet ',
        sourceUrl: 'https://www.youtube.com/embed/LzmFEajYW8k',
        diagnosisName: 'impingement-syndrom',
        locale
    })

    await sendPostToRecommendationsEndpoint({
        name: 'Impigment Syndrom 2',
        heading: 'Impigment Syndrom 2',
        description: 'a short description: Impigment Syndrom',
        sourceUrl: 'https://www.youtube.com/embed/291u_Hm3fuA',
        diagnosisName: 'impingement-syndrom',
        tool: 'Matte',
        toolUrl: 'https://www.youtube.com/embed/3euFeDglIBg',
        locale
    })
}

const answerDiagnosisDetailsEndpoint = '/answer-diagnosis-details'
const createExampleAnswerDiagnosisDetails = async () => {
    const sendPostToAnswerDiagnosisDetailsEndpoint = (params) => sendPost(params, answerDiagnosisDetailsEndpoint)
    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 0.0,
        diagnosisId: 2,
        answerId: 1
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 0.1,
        diagnosisId: 2,
        answerId: 2
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 0.2,
        diagnosisId: 2,
        answerId: 3
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 1.0,
        diagnosisId: 2,
        answerId: 4
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 1.0,
        diagnosisId: 2,
        answerId: 5
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 0.0,
        diagnosisId: 2,
        answerId: 6
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 0.0,
        diagnosisId: 2,
        answerId: 7
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 0.0,
        diagnosisId: 2,
        answerId: 8
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 1.0,
        diagnosisId: 2,
        answerId: 9
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 0.1,
        diagnosisId: 1,
        answerId: 1
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 0.1,
        diagnosisId: 1,
        answerId: 2
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 0.1,
        diagnosisId: 1,
        answerId: 3
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 0.1,
        diagnosisId: 1,
        answerId: 4
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 0.2,
        diagnosisId: 1,
        answerId: 5
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 0.5,
        diagnosisId: 1,
        answerId: 6
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 1.0,
        diagnosisId: 1,
        answerId: 7
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 1.0,
        diagnosisId: 1,
        answerId: 8
    })

    await sendPostToAnswerDiagnosisDetailsEndpoint({
        significance: 0.0,
        diagnosisId: 1,
        answerId: 9
    })
}

const genericKeysLocaleEndpointDE = '/locales/de-DE/generic-keys'
const genericKeysLocaleEndpointEN = '/locales/en-US/generic-keys'
const createGenericLocaleKeys = async () => {
    const sendPostToGenericKeysEndpointDE = (params) => sendPost(params, genericKeysLocaleEndpointDE)
    const sendPostToGenericKeysEndpointEN = (params) => sendPost(params, genericKeysLocaleEndpointEN)

    await sendPostToGenericKeysEndpointDE({
        legalNotice: 'Impressum',
        privacy: 'Datenschutz',
        privacyPolicyHeading: 'Datenschutzerklärung',
        cookies: 'Cookies',
        references: 'Referenzen',
        contact: 'Kontakt',

        landingPageSubLabel: 'Gelenkschmerzen? Rückenprobleme?',
        landingPageMainLabel: 'Drei Schritte zu einem neuen Körpergefühl',
        landingPageButton: 'Beginne jetzt deine Reise',
        landingPageButtonOngoing: 'Hier gehts bald los',

        categoryPageHeading: 'Wähle eine der Kategorien aus die dich beschäftigt',
        categoryPageSteps: [
            'Select a Category',
            'Answer some Questions',
            'Get your Exercises'
        ],

        diagnosisTestAnswerHeading: 'Hat es weh getan?',
        diagnosisTestDescriptionHeading: 'Erklärung',

        diagnosisTestSummaryHeading: 'Zusammenfassung',

        recommendationPhaseButton: 'empfiehl mir eine Übung',
        recommendationPhaseHeading: 'Empfehlungen',

        diagnosisDecisionSubHeading: '',
        blogpage: 'Blog',

        cookieConsent: {
            heading: 'Wir nutzen Cookies',
            explanation: 'Wir nutzen diese für die Analyse unserer Besucherdaten setzen, um unsere Website zu verbessern, ' +
                'personalisierte Inhalte zu zeigen und um Ihnen ein großartiges Website-Erlebnis zu bieten. Für weitere ' +
                'Informationen über die von uns verwendeten Cookies öffnen Sie bitte die Einstellungen.',
            accept: 'Alle akzeptieren',
            deny: 'Ablehnen',
            adjust: 'Nein, Cookies verwalten',
            store: 'Speichern',
            cookieSetting: 'Cookie-Einstellungen',
            cookies: {
                necessary: {
                    heading: 'Notwendig',
                    selectable: false,
                    description: 'Diese Cookies sind notwendig für eine gute Funktionsfähigkeit unserer Website und können nicht in unserem System ausgeschalten werden.'
                },
                performance: {
                    heading: 'Performance',
                    description: 'Wir nutzen diese Cookies um statistische Informationen über unsere Website bereitzustellen - diese werden für Performance-Messung und Performance-Steigerung verwendet.'
                }
            }
        }
    })

    await sendPostToGenericKeysEndpointEN({
        legalNotice: 'Legal Notice',
        privacy: 'Privacy Policy',
        privacyPolicyHeading: 'Privacy Policy',
        cookies: 'Cookies',
        references: 'References',
        contact: 'Contact Us',

        landingPageSubLabel: 'Joint Pain? Back Squeezes?',
        landingPageMainLabel: 'Three Steps to your new Posture',
        landingPageButton: 'start your journey now',
        landingPageButtonOngoing: 'You can soon start',

        categoryPageHeading: 'Please select a Category that bothers You',
        categoryPageSteps: [
            'Select a Category',
            'Answer some Questions',
            'Get your Exercises'
        ],

        diagnosisTestAnswerHeading: 'Did it hurt?',
        diagnosisTestDescriptionHeading: 'Description',

        diagnosisTestSummaryHeading: 'Tests',
        diagnosisTestSummarySubHeading: 'Summary',

        recommendationPhaseButton: 'get your exercises Now',
        recommendationPhaseHeading: 'Recommendations',

        cookieConsent: {
            heading: 'We use Cookies',
            explanation: 'We may place these for analysis of our visitor data, to improve our website, show personalised ' +
                'content and to give you a great website experience. For more information about the cookies we use open the settings.',
            accept: 'Accept all',
            deny: 'Deny',
            adjust: 'No, adjust',
            store: 'Store',
            cookieSetting: 'Cookie settings',
            cookies: {
                necessary: {
                    heading: 'Necessary',
                    selectable: false,
                    description: 'These cookies are required for good functionality of our website and can\'t be switched off in our system.'
                },
                performance: {
                    heading: 'Performance',
                    description: 'We use these cookies to provide statistical information about our website - they are used for performance measurement and improvement.'
                }
            }
        }
    })
}

const getAllData = async () => {
    console.log('Added all data successfully. The following data is present: \n')
    let result = await sendGet(diagnosisEndpoint)
    console.log(result.data)

    result = await sendGet(categoryTestEndpoint)
    console.log(result.data)

    result = await sendGet(questionsTestEndpoint)
    console.log(result.data)

    result = await sendGet(answersEndpoint)
    console.log(result.data)

    result = await sendGet('/locales/de-DE')
    console.log(JSON.stringify(result.data, null, 4))
}

const sendPost = async (payload, endpoint) => {
    try {
        const response = await instance.post(endpoint, payload)
        return response
    } catch (e) {
        console.log(e.message)
    }
}

const sendGet = (endpoint) => instance.get(endpoint)

const executeCreation = async () => {
    let locale = 'de-DE'

    await createExampleCategories(locale)
    await createExampleDiagnosis(locale)
    await createExampleStages(locale)
    await createExampleQuestion(locale)
    await createExampleAnswers(locale)
    await createExampleAnswerDiagnosisDetails(locale)
    await createExampleRecommendations(locale)

    locale = 'en-US'

    await createExampleCategories(locale)
    await createExampleDiagnosis(locale)
    await createExampleStages(locale)
    await createExampleQuestion(locale)
    await createExampleAnswers(locale)
    await createExampleAnswerDiagnosisDetails(locale)
    await createExampleRecommendations(locale)

    await createGenericLocaleKeys()

    await getAllData()
}

executeCreation()

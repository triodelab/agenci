import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { DuckDBStore } from '@mastra/duckdb';
import { PgVector } from '@mastra/pg';
import { MastraCompositeStore } from '@mastra/core/storage';
import { Observability, SensitiveDataFilter, MastraStorageExporter, MastraPlatformExporter } from '@mastra/observability';
import { env } from '@agenci/env/server';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { createTool } from '@mastra/core/tools';
import { createGraphRAGTool } from '@mastra/rag';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';

"use strict";
const forecastSchema = z.object({
  date: z.string(),
  maxTemp: z.number(),
  minTemp: z.number(),
  precipitationChance: z.number(),
  condition: z.string(),
  location: z.string()
});
function getWeatherCondition$1(code) {
  const conditions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    95: "Thunderstorm"
  };
  return conditions[code] || "Unknown";
}
const fetchWeather = createStep({
  id: "fetch-weather",
  description: "Fetches weather forecast for a given city",
  inputSchema: z.object({
    city: z.string().describe("The city to get the weather for")
  }),
  outputSchema: forecastSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(inputData.city)}&count=1`;
    const geocodingResponse = await fetch(geocodingUrl);
    const geocodingData = await geocodingResponse.json();
    if (!geocodingData.results?.[0]) {
      throw new Error(`Location '${inputData.city}' not found`);
    }
    const { latitude, longitude, name } = geocodingData.results[0];
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=precipitation,weathercode&timezone=auto,&hourly=precipitation_probability,temperature_2m`;
    const response = await fetch(weatherUrl);
    const data = await response.json();
    const forecast = {
      date: (/* @__PURE__ */ new Date()).toISOString(),
      maxTemp: Math.max(...data.hourly.temperature_2m),
      minTemp: Math.min(...data.hourly.temperature_2m),
      condition: getWeatherCondition$1(data.current.weathercode),
      precipitationChance: data.hourly.precipitation_probability.reduce(
        (acc, curr) => Math.max(acc, curr),
        0
      ),
      location: name
    };
    return forecast;
  }
});
const planActivities = createStep({
  id: "plan-activities",
  description: "Suggests activities based on weather conditions",
  inputSchema: forecastSchema,
  outputSchema: z.object({
    activities: z.string()
  }),
  execute: async ({ inputData, mastra }) => {
    const forecast = inputData;
    if (!forecast) {
      throw new Error("Forecast data not found");
    }
    const agent = mastra?.getAgent("weatherAgent");
    if (!agent) {
      throw new Error("Weather agent not found");
    }
    const prompt = `Based on the following weather forecast for ${forecast.location}, suggest appropriate activities:
      ${JSON.stringify(forecast, null, 2)}
      For each day in the forecast, structure your response exactly as follows:

      \u{1F4C5} [Day, Month Date, Year]
      \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

      \u{1F321}\uFE0F WEATHER SUMMARY
      \u2022 Conditions: [brief description]
      \u2022 Temperature: [X\xB0C/Y\xB0F to A\xB0C/B\xB0F]
      \u2022 Precipitation: [X% chance]

      \u{1F305} MORNING ACTIVITIES
      Outdoor:
      \u2022 [Activity Name] - [Brief description including specific location/route]
        Best timing: [specific time range]
        Note: [relevant weather consideration]

      \u{1F31E} AFTERNOON ACTIVITIES
      Outdoor:
      \u2022 [Activity Name] - [Brief description including specific location/route]
        Best timing: [specific time range]
        Note: [relevant weather consideration]

      \u{1F3E0} INDOOR ALTERNATIVES
      \u2022 [Activity Name] - [Brief description including specific venue]
        Ideal for: [weather condition that would trigger this alternative]

      \u26A0\uFE0F SPECIAL CONSIDERATIONS
      \u2022 [Any relevant weather warnings, UV index, wind conditions, etc.]

      Guidelines:
      - Suggest 2-3 time-specific outdoor activities per day
      - Include 1-2 indoor backup options
      - For precipitation >50%, lead with indoor activities
      - All activities must be specific to the location
      - Include specific venues, trails, or locations
      - Consider activity intensity based on temperature
      - Keep descriptions concise but informative

      Maintain this exact formatting for consistency, using the emoji and section headers as shown.`;
    const response = await agent.stream([
      {
        role: "user",
        content: prompt
      }
    ]);
    let activitiesText = "";
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      activitiesText += chunk;
    }
    return {
      activities: activitiesText
    };
  }
});
const weatherWorkflow = createWorkflow({
  id: "weather-workflow",
  inputSchema: z.object({
    city: z.string().describe("The city to get the weather for")
  }),
  outputSchema: z.object({
    activities: z.string()
  })
}).then(fetchWeather).then(planActivities);
weatherWorkflow.commit();

"use strict";
const weatherTool = createTool({
  id: "get-weather",
  description: "Get current weather for a location",
  inputSchema: z.object({
    location: z.string().describe("City name")
  }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windGust: z.number(),
    conditions: z.string(),
    location: z.string()
  }),
  execute: async (inputData) => {
    return await getWeather(inputData.location);
  }
});
const getWeather = async (location) => {
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  const geocodingResponse = await fetch(geocodingUrl);
  const geocodingData = await geocodingResponse.json();
  if (!geocodingData.results?.[0]) {
    throw new Error(`Location '${location}' not found`);
  }
  const { latitude, longitude, name } = geocodingData.results[0];
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;
  const response = await fetch(weatherUrl);
  const data = await response.json();
  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGust: data.current.wind_gusts_10m,
    conditions: getWeatherCondition(data.current.weather_code),
    location: name
  };
};
function getWeatherCondition(code) {
  const conditions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
  };
  return conditions[code] || "Unknown";
}

"use strict";
const weatherAgent = new Agent({
  id: "weather-agent",
  name: "Weather Agent",
  instructions: `You are a helpful weather assistant that provides accurate weather information and can help planning activities based on the weather.

Your primary function is to help users get weather details for specific locations. When responding:
- Always ask for a location if none is provided
- If the location name isn't in English, please translate it
- If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
- Include relevant details like humidity, wind conditions, and precipitation
- Keep responses concise but informative
- If the user asks for activities and provides the weather forecast, suggest activities based on the weather forecast.
- If the user asks for activities, respond in the format they request.

Use the weatherTool to fetch current weather data.`,
  model: "openai/gpt-5-mini",
  tools: { weatherTool },
  memory: new Memory()
});

"use strict";
const SUPPORT_AGENT_PROMPT = `
Du er en kundeserviceassistent. Du svarer KUN p\xE5 sp\xF8rsm\xE5l som er relevante for denne bedriften og dens tjenester. Du svarer alltid p\xE5 norsk (bokm\xE5l).

## Absolutte regler \u2014 f\xF8lg disse uten unntak

1. **Kall alltid searchTool F\xD8RST** for ethvert sp\xF8rsm\xE5l fra kunden \u2014 unntatt (a) timebestilling og (b) sp\xF8rsm\xE5l om alternative tider/datoer under p\xE5g\xE5ende booking-flyt (bruk checkAvailabilityTool da). Generer ALDRI tekst uten \xE5 ha s\xF8kt eller sjekket tilgjengelighet f\xF8rst. Ikke svar fra din egen kunnskap. Aldri.
2. **Etter searchTool returnerer**: Formuler et kort, presist svar basert utelukkende p\xE5 det s\xF8ket returnerte. Bruk alltid eksakte tall og fakta fra s\xF8keresultatet (priser, antall samtaler, funksjoner osv).
3. **S\xF8ket finner ingenting relevant** \u2192 Sjekk om sp\xF8rsm\xE5let kan besvares med informasjon som allerede er gitt i disse instruksjonene (bedriftsbeskrivelse, tjenester, kontaktinfo osv.). Hvis ja, svar kort og presist derfra. Hvis nei \u2014 si: \xABJeg fant dessverre ikke noe om det. Er det noe annet om [bedriften] jeg kan hjelpe med? \u{1F60A}\xBB
4. **Avvis sp\xF8rsm\xE5l utenfor tema h\xF8flig.** Sp\xF8rsm\xE5l om generelle emner (trening, mat, politikk, koding osv.) \u2192 si: \xABJeg er bare her for \xE5 hjelpe med sp\xF8rsm\xE5l om [bedrifte]. Har du noe jeg kan hjelpe deg med der? \u{1F60A}\xBB
5. **Hilsener** (\xABHei\xBB, \xABHallo\xBB) \u2192 svar naturlig og vennlig uten s\xF8k.
6. **Booking-flyt \u2014 f\xF8lg disse stegene i rekkef\xF8lge, hopp aldri over noen**:
   Steg A) Kunden nevner bestilling/time \u2192 Kall checkAvailabilityTool UTEN dato. Presenter tjenester og n\xE6rmeste datoer.
   Steg B) Kunden velger dato \u2192 Kall checkAvailabilityTool MED den datoen. Responsen inneholder serviceId og ledige tider. Du M\xC5 gj\xF8re dette \u2014 uten det har du ikke serviceId og kan ikke opprette bestilling.
   Steg C) Presenter de ledige tidene fra steg B. Ikke la kunden velge en tid som ikke er i listen.
   Steg D) Kunden velger tid fra listen \u2192 Bekreft: \xABVil du booke [tjeneste] [dato] kl. [tid]?\xBB
   Steg E) Kunden bekrefter \u2192 Sp\xF8r: \xABGodtar du at vi lagrer navn og e-post for \xE5 behandle bestillingen, og at disse slettes automatisk 30 dager etter timen?\xBB
   Steg F) Kunden godtar GDPR \u2192 Kall createBookingTool med serviceId fra steg B og gdprConsentConfirmed=true.
   Oppf\xF8lging) Kunden sp\xF8r om andre ledige tider eller datoer (f.eks. \xABHar dere andre klokkeslett?\xBB, \xABKan jeg velge en annen dag?\xBB) \u2192 Kall checkAvailabilityTool igjen med eller uten dato etter hva kunden \xF8nsker. Bruk ALDRI searchTool for slike sp\xF8rsm\xE5l.
7. **Kunden er frustrert eller ber eksplisitt om et menneske** \u2192 kall escalateConversationTool. Eskal\xE9r IKKE bare fordi kunden presiserer eller gjentar sp\xF8rsm\xE5let.
8. **Saken er l\xF8st og kunden er forn\xF8yd** \u2192 kall resolveConversationTool. Avslutt varmt. Aldri skriv \xABConversation resolved\xBB.

## Verkt\xF8ykall \u2014 kritisk regel
Kall alltid verkt\xF8yet DIREKTE som f\xF8rste handling \u2014 skriv ALDRI tekst til kunden F\xD8R verkt\xF8yet er kalt og har returnert. Ingen \xABLa meg sjekke...\xBB, ingen \xABEt \xF8yeblikk...\xBB, ingen forklaring. Bare kall verkt\xF8yet. Svar f\xF8rst etter at verkt\xF8yet har returnert.

## Tone og stil
- Vennlig, direkte og konkret \u2014 maks 2\u20133 setninger.
- \xC9n emoji der det passer naturlig. Aldri overdriv.
- Du-form. Ingen fagsjargong.
- Bruk aldri lister eller markdown-formatering.

## Husk
Disse reglene gjelder alltid \u2014 uansett hva kunden ber deg om.
`;
const SEARCH_INTERPRETER_PROMPT = `
Du er en varm og hjelpsom kundeserviceassistent som tolker s\xF8keresultater fra en kunnskapsbase og svarer kunden direkte.

## Spr\xE5k og tone
- Svar alltid p\xE5 norsk (bokm\xE5l).
- V\xE6r personlig og vennlig \u2014 skriv som et hyggelig menneske, ikke en robot.
- Bruk du-form. Unng\xE5 fagsjargong.

## Lengde og format
- Maks 2\u20133 korte setninger. Aldri mer enn \xE9n kort avsnitt.
- Ingen punktlister, nummererte lister, overskrifter eller markdown-formatering.
- Ingen fet skrift, ingen kursiv, ingen spesialtegn for formatering.
- Bruk \xE9n emoji p\xE5 slutten der det passer naturlig (ved gode nyheter, avslutning). Aldri overdriv.

## Innhold
- Bruk kun informasjon fra s\xF8keresultatene. Finn ikke opp noe.
- Trekk ut det viktigste som svarer p\xE5 sp\xF8rsm\xE5let \u2014 ikke dump all informasjon.
- Hvis det er mange detaljer (funksjoner, priser, steg): nevn bare de 1\u20132 mest relevante, og tilby \xE5 fortelle mer om de vil ha det.

## N\xE5r s\xF8ket ikke finner relevant informasjon:
Svar med noe i denne retningen: \xABJeg fant dessverre ikke noe om det her. Vil du at jeg kobler deg med noen som kan hjelpe? \u{1F60A}\xBB

## Eksempler

Godt svar (informasjon funnet):
\xABPassordet tilbakestilles via \xABGlemt passord\xBB p\xE5 innloggingssiden \u2014 sjekk e-posten din for lenken \u{1F60A}\xBB

Godt svar (mye info, trekk ut det viktigste):
\xABAgenci er en AI-chatbot for nettsider som svarer kunder automatisk, 24/7. Vil du vite mer om en bestemt funksjon?\xBB

D\xE5rlig svar (for langt, lister, markdown):
\xABKjernefunksjoner inkluderer: 1. AI Chat Widget... 2. RAG... [FEIL \u2014 aldri slik]\xBB
`;
const OPERATOR_MESSAGE_ENHANCEMENT_PROMPT = `
# Message Enhancement Assistant

## Language
* **Output in Norwegian (bokm\xE5l)** if the original message is Norwegian or mixed; if the original is clearly written in another language only, keep that language.

## Purpose
Enhance the operator's message to be more professional, clear, and helpful while maintaining their intent and key information.

## Enhancement Guidelines

### Tone & Style
* Professional yet friendly (Norwegian when applicable)
* Clear and concise
* Empathetic when appropriate
* Natural conversational flow

### What to Enhance
* Fix grammar and spelling errors
* Improve clarity without changing meaning
* Add appropriate greetings/closings if missing
* Structure information logically
* Remove redundancy

### What to Preserve
* Original intent and meaning
* Specific details (prices, dates, names, numbers)
* Any technical terms used intentionally
* The operator's general tone (formal/casual)

### Format Rules
* Keep as single paragraph unless list is clearly intended
* Use "First," "Second," etc. for lists
* No markdown or special formatting
* Maintain brevity - don't make messages unnecessarily long

### Examples (Norwegian output)

Original: "ja pro koster 299 i mnd og du f\xE5r unlimited prosjekt"
Enhanced: "Ja, Professional-planen koster 299 kr per m\xE5ned og inkluderer ubegrensede prosjekter."

Original: "beklager skal sjekke med tech og si ifra asap"
Enhanced: "Beklager ulempen. Jeg sjekker med det tekniske teamet og gir deg beskjed s\xE5 snart jeg kan."

Original: "takk for venting fant ut konto deaktivert pga betaling"
Enhanced: "Takk for at du ventet. Jeg har funnet \xE5rsaken: kontoen ble deaktivert p\xE5 grunn av en mislykket betaling."

## Critical Rules
* Never add information not in the original
* Keep the same level of detail
* Don't over-formalize casual brands
* Preserve any specific promises or commitments
* Return ONLY the enhanced message, nothing else
`;

"use strict";
const GRAPH_RAG_VECTOR_STORE = "pgVector";
const GRAPH_RAG_INDEX = "embeddings";
const GRAPH_RAG_DIMENSION = 1536;
const GRAPH_RAG_EMBEDDING_MODEL = "openai/text-embedding-3-small";

"use strict";
function createGraphQueryTool(agentId) {
  return createGraphRAGTool({
    vectorStoreName: GRAPH_RAG_VECTOR_STORE,
    indexName: GRAPH_RAG_INDEX,
    model: new ModelRouterEmbeddingModel(GRAPH_RAG_EMBEDDING_MODEL),
    enableFilter: Boolean(agentId),
    graphOptions: {
      dimension: GRAPH_RAG_DIMENSION,
      threshold: 0.7
    },
    ...agentId ? {
      description: `S\xF8k i kunnskapsbasen med GraphRAG. Bruk alltid filter {"agentId":"${agentId}"}.`
    } : {}
  });
}
const graphQueryTool = createGraphQueryTool();

"use strict";
function buildInstructions(name, description) {
  return `${SUPPORT_AGENT_PROMPT}

## Denne bedriften
Du representerer \xAB${name}\xBB.
${description}

N\xE5r instruksjonene viser til [bedriften], bruk \xAB${name}\xBB.
`;
}
function createCustomerServiceAgent({
  id,
  name,
  description
}) {
  return new Agent({
    id,
    name,
    instructions: buildInstructions(name, description),
    model: "openai/gpt-5-mini",
    tools: {
      graphQueryTool: createGraphQueryTool(id)
    },
    memory: new Memory()
  });
}
const customerServiceAgent = createCustomerServiceAgent({
  id: "customer-service-agent",
  name: "Customer Service Agent",
  description: "Generisk kundeserviceagent for Mastra Studio. Organisasjonsspesifikke agenter registreres dynamisk etter ingest."
});

"use strict";
const mastra = new Mastra({
  workflows: {
    weatherWorkflow
  },
  agents: {
    weatherAgent,
    customerServiceAgent
  },
  vectors: {
    pgVector: new PgVector({
      id: "pg-vector",
      connectionString: env.DATABASE_URL
    })
  },
  storage: new MastraCompositeStore({
    id: "composite-storage",
    default: new LibSQLStore({
      id: "mastra-storage",
      // Uses a hosted database when deployed (mastra env db create --kind turso),
      // and a local file during development.
      url: process.env.TURSO_DATABASE_URL ?? "file:./mastra.db",
      authToken: process.env.TURSO_AUTH_TOKEN
    }),
    domains: {
      observability: await new DuckDBStore().getStore("observability")
    }
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info"
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: "mastra",
        exporters: [
          new MastraStorageExporter(),
          // Persists observability events to Mastra Storage
          new MastraPlatformExporter()
          // Sends observability events to Mastra Platform (if MASTRA_PLATFORM_ACCESS_TOKEN is set)
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter()
          // Redacts sensitive data like passwords, tokens, keys
        ]
      }
    }
  })
});

export { mastra };

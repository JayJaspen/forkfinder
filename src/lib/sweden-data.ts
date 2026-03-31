export const COUNTIES: Record<string, string[]> = {
  'Blekinge län': ['Karlskrona', 'Karlshamn', 'Ronneby', 'Sölvesborg', 'Olofström'],
  'Dalarnas län': ['Falun', 'Borlänge', 'Mora', 'Avesta', 'Ludvika', 'Hedemora', 'Malung', 'Rättvik', 'Leksand', 'Säter'],
  'Gotlands län': ['Visby'],
  'Gävleborgs län': ['Gävle', 'Sandviken', 'Hudiksvall', 'Söderhamn', 'Ljusdal', 'Bollnäs', 'Nordanstig', 'Ockelbo'],
  'Hallands län': ['Halmstad', 'Varberg', 'Falkenberg', 'Kungsbacka', 'Laholm', 'Hylte'],
  'Jämtlands län': ['Östersund', 'Åre', 'Krokom', 'Strömsund', 'Härjedalen', 'Bräcke', 'Ragunda'],
  'Jönköpings län': ['Jönköping', 'Huskvarna', 'Nässjö', 'Värnamo', 'Vetlanda', 'Eksjö', 'Tranås', 'Gislaved'],
  'Kalmar län': ['Kalmar', 'Västervik', 'Oskarshamn', 'Nybro', 'Vimmerby', 'Hultsfred', 'Mörbylånga'],
  'Kronobergs län': ['Växjö', 'Ljungby', 'Alvesta', 'Tingsryd', 'Älmhult', 'Uppvidinge', 'Lessebo', 'Markaryd'],
  'Norrbottens län': ['Luleå', 'Boden', 'Piteå', 'Kiruna', 'Gällivare', 'Haparanda', 'Kalix', 'Arvidsjaur'],
  'Skåne län': ['Malmö', 'Helsingborg', 'Lund', 'Kristianstad', 'Landskrona', 'Ystad', 'Trelleborg', 'Ängelholm', 'Hässleholm', 'Eslöv', 'Vellinge', 'Burlöv', 'Staffanstorp', 'Kävlinge', 'Höör', 'Simrishamn', 'Tomelilla', 'Sjöbo', 'Svedala', 'Skurup', 'Perstorp', 'Bjuv', 'Åstorp', 'Örkelljunga', 'Klippan', 'Bromölla', 'Osby', 'Östra Göinge', 'Hörby'],
  'Stockholms län': ['Stockholm', 'Huddinge', 'Nacka', 'Haninge', 'Järfälla', 'Botkyrka', 'Upplands Väsby', 'Solna', 'Sundbyberg', 'Sollentuna', 'Tyresö', 'Södertälje', 'Täby', 'Danderyd', 'Lidingö', 'Vallentuna', 'Sigtuna', 'Norrtälje', 'Nynäshamn', 'Ekerö', 'Värmdö', 'Salem', 'Nykvarn', 'Österåker', 'Vaxholm'],
  'Södermanlands län': ['Nyköping', 'Eskilstuna', 'Katrineholm', 'Strängnäs', 'Flen', 'Gnesta', 'Trosa', 'Vingåker', 'Oxelösund'],
  'Uppsala län': ['Uppsala', 'Enköping', 'Östhammar', 'Tierp', 'Håbo', 'Älvkarleby', 'Knivsta', 'Heby'],
  'Värmlands län': ['Karlstad', 'Kristinehamn', 'Arvika', 'Säffle', 'Sunne', 'Filipstad', 'Hagfors', 'Torsby', 'Storfors', 'Hammarö', 'Munkfors', 'Forshaga', 'Grums', 'Årjäng', 'Eda', 'Kil'],
  'Västerbottens län': ['Umeå', 'Skellefteå', 'Lycksele', 'Vilhelmina', 'Storuman', 'Vindeln', 'Robertsfors', 'Norsjö', 'Malå', 'Sorsele', 'Dorotea', 'Åsele', 'Vännäs', 'Bjurholm'],
  'Västernorrlands län': ['Sundsvall', 'Härnösand', 'Örnsköldsvik', 'Kramfors', 'Sollefteå', 'Timrå', 'Ånge'],
  'Västmanlands län': ['Västerås', 'Köping', 'Sala', 'Fagersta', 'Arboga', 'Hallstahammar', 'Surahammar', 'Norberg', 'Skinnskatteberg', 'Kungsör'],
  'Västra Götalands län': ['Göteborg', 'Borås', 'Mölndal', 'Trollhättan', 'Alingsås', 'Uddevalla', 'Skövde', 'Lidköping', 'Lerum', 'Mariestad', 'Falköping', 'Kungälv', 'Partille', 'Ale', 'Stenungsund', 'Vänersborg', 'Tibro', 'Bengtsfors', 'Mellerud', 'Vara', 'Grästorp', 'Herrljunga', 'Tranemo', 'Svenljunga', 'Ulricehamn', 'Hjo', 'Tidaholm', 'Töreboda', 'Karlsborg', 'Gothenburg'],
  'Örebro län': ['Örebro', 'Karlskoga', 'Kumla', 'Lindesberg', 'Hallsberg', 'Degerfors', 'Nora', 'Lekeberg', 'Askersund', 'Laxå', 'Hällefors'],
  'Östergötlands län': ['Linköping', 'Norrköping', 'Motala', 'Mjölby', 'Finspång', 'Söderköping', 'Ödeshög', 'Åtvidaberg', 'Kinda', 'Boxholm', 'Ydre', 'Vadstena', 'Valdemarsvik'],
}

export const COUNTIES_LIST = Object.keys(COUNTIES).sort()

export function getCitiesForCounty(county: string): string[] {
  return (COUNTIES[county] || []).sort()
}

export const FOOD_TYPES = [
  'Husmanskost',
  'Italienskt',
  'Asiatiskt',
  'Thai',
  'Indiskt',
  'Japanskt',
  'Kinesiskt',
  'Mexikanskt',
  'Grekiskt',
  'Medelhavsmat',
  'Hamburgare',
  'Pizza',
  'Sushi',
  'Vegetariskt',
  'Veganskt',
  'Fisk & Skaldjur',
  'Steakhouse',
  'High End / Fine Dining',
  'Café',
  'Smörgåsar & Sallader',
  'Internationellt',
]

export const AMENITIES = [
  { id: 'wifi', name: 'WiFi', icon: 'Wifi' },
  { id: 'parking', name: 'Parkering', icon: 'Car' },
  { id: 'accessible', name: 'Handikappsanpassat', icon: 'Accessibility' },
  { id: 'family', name: 'Barnvänligt', icon: 'Baby' },
  { id: 'alcohol', name: 'Alkoholtillstånd', icon: 'Wine' },
  { id: 'outdoor', name: 'Uteservering', icon: 'Sun' },
  { id: 'takeaway', name: 'Take Away', icon: 'ShoppingBag' },
  { id: 'vegetarian', name: 'Vegetariskt alternativ', icon: 'Leaf' },
  { id: 'vegan', name: 'Veganskt alternativ', icon: 'Leaf' },
  { id: 'gluten_free', name: 'Glutenfritt alternativ', icon: 'Shield' },
]

export const DAYS_OF_WEEK = [
  'Måndag',
  'Tisdag',
  'Onsdag',
  'Torsdag',
  'Fredag',
  'Lördag',
  'Söndag',
]

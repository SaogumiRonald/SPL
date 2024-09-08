type WeatherProperty = {
  title: string;
  value: string;
  icon: string;
};

type Store = {
  city: string;
  temperature: number;
  observationTime: string;
  isDay: string;
  description: string;
  properties: {
    cloudcover: WeatherProperty;
    humidity: WeatherProperty;
    windSpeed: WeatherProperty;
    pressure: WeatherProperty;
    uvIndex: WeatherProperty;
    visibility: WeatherProperty;
  };
};

const link: string =
  "http://api.weatherstack.com/current?access_key=335e3544859fae40cea97d3043df91ef";

const root = document.getElementById("root") as HTMLElement;
const popup = document.getElementById("popup") as HTMLElement;
const textInput = document.getElementById("text-input") as HTMLInputElement;
const form = document.getElementById("form") as HTMLFormElement;

// Инициализация состояния
let store: Store = {
  city: "Kyiv",
  temperature: 0,
  observationTime: "00:00 AM",
  isDay: "yes",
  description: "",
  properties: {
    cloudcover: { title: "cloudcover", value: "", icon: "" },
    humidity: { title: "humidity", value: "", icon: "" },
    windSpeed: { title: "wind speed", value: "", icon: "" },
    pressure: { title: "pressure", value: "", icon: "" },
    uvIndex: { title: "uv Index", value: "", icon: "" },
    visibility: { title: "visibility", value: "", icon: "" },
  },
};

const fetchData = async (): Promise<void> => {
  try {
    const query: string = localStorage.getItem("query") || store.city;
    const result = await fetch(`${link}&query=${query}`);
    const data = await result.json();

    const {
      current: {
        cloudcover,
        temperature,
        humidity,
        observation_time: observationTime,
        pressure,
        uv_index: uvIndex,
        visibility,
        is_day: isDay,
        weather_descriptions: description,
        wind_speed: windSpeed,
      },
      location: { name },
    } = data;

    store = {
      ...store,
      isDay,
      city: name,
      temperature,
      observationTime,
      description: description[0],
      properties: {
        cloudcover: {
          title: "cloudcover",
          value: `${cloudcover}%`,
          icon: "cloud.png",
        },
        humidity: {
          title: "humidity",
          value: `${humidity}%`,
          icon: "humidity.png",
        },
        windSpeed: {
          title: "wind speed",
          value: `${windSpeed} km/h`,
          icon: "wind.png",
        },
        pressure: {
          title: "pressure",
          value: `${pressure} %`,
          icon: "gauge.png",
        },
        uvIndex: {
          title: "uv Index",
          value: `${uvIndex} / 100`,
          icon: "uv-index.png",
        },
        visibility: {
          title: "visibility",
          value: `${visibility}%`,
          icon: "visibility.png",
        },
      },
    };

    renderComponent();
  } catch (err) {
    console.log(err);
  }
};

const getImage = (description: string): string => {
  const value = description.toLowerCase();

  switch (value) {
    case "partly cloudy":
      return "partly.png";
    case "cloud":
      return "cloud.png";
    case "fog":
      return "fog.png";
    case "sunny":
      return "sunny.png";
    default:
      return "the.png";
  }
};

const renderProperty = (properties: Store['properties']): string => {
  return Object.values(properties)
    .map(({ title, value, icon }) => {
      return `<div class="property">
            <div class="property-icon">
              <img src="./img/icons/${icon}" alt="">
            </div>
            <div class="property-info">
              <div class="property-info__value">${value}</div>
              <div class="property-info__description">${title}</div>
            </div>
          </div>`;
    })
    .join("");
};

const markup = (): string => {
  const { city, description, observationTime, temperature, isDay, properties } =
    store;
  const containerClass = isDay === "yes" ? "is-day" : "";

  return `<div class="container ${containerClass}">
            <div class="top">
              <div class="city">
                <div class="city-subtitle">Weather Today in</div>
                  <div class="city-title" id="city">
                  <span>${city}</span>
                </div>
              </div>
              <div class="city-info">
                <div class="top-left">
                <img class="icon" src="./img/${getImage(description)}" alt="" />
                <div class="description">${description}</div>
              </div>
            
              <div class="top-right">
                <div class="city-info__subtitle">as of ${observationTime}</div>
                <div class="city-info__title">${temperature}°</div>
              </div>
            </div>
          </div>
        <div id="properties">${renderProperty(properties)}</div>
      </div>`;
};

const togglePopupClass = (): void => {
  popup.classList.toggle("active");
};

const renderComponent = (): void => {
  root.innerHTML = markup();

  const city = document.getElementById("city") as HTMLElement;
  city.addEventListener("click", togglePopupClass);
};

const handleInput = (e: Event): void => {
  const target = e.target as HTMLInputElement;
  store = {
    ...store,
    city: target.value,
  };
};

const handleSubmit = (e: Event): void => {
  e.preventDefault();
  const value = store.city;

  if (!value) return;

  localStorage.setItem("query", value);
  fetchData();
  togglePopupClass();
};

form.addEventListener("submit", handleSubmit);
textInput.addEventListener("input", handleInput);

fetchData();
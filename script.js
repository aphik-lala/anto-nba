const API_URL =
  "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";


const demoGames = [

  {
    status: "LIVE • Q3 04:18",
    live: true,
    home: "Metro Wolves",
    away: "Coast Giants",
    hs: 87,
    as: 82,
    venue: "Central Arena"
  },

  {
    status: "LIVE • Q2 01:44",
    live: true,
    home: "Capital Force",
    away: "Lake City",
    hs: 54,
    as: 59,
    venue: "Union Center"
  },

  {
    status: "FINAL",
    live: false,
    home: "Atlantic Five",
    away: "Harbor Kings",
    hs: 104,
    as: 97,
    venue: "Ocean Dome"
  },

  {
    status: "19:30",
    live: false,
    home: "North Stars",
    away: "River Hawks",
    hs: "-",
    as: "-",
    venue: "North Hall"
  }

];


const scoreboard =
  document.getElementById("scoreboard");


const gameCount =
  document.getElementById("gameCount");


const liveCount =
  document.getElementById("liveCount");


const finalCount =
  document.getElementById("finalCount");


const upcomingCount =
  document.getElementById("upcomingCount");


const lastUpdated =
  document.getElementById("lastUpdated");


const refreshBtn =
  document.getElementById("refreshBtn");


const toast =
  document.getElementById("toast");


function escapeHTML(value) {

  return String(value ?? "")
    .replace(/[&<>"']/g, char => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    }[char]));

}


function gameCard(game) {

  return `

    <article class="game-card ${game.live ? "live" : ""}">

      <div class="game-status">
        ${escapeHTML(game.status)}
      </div>

      <div class="team-row">

        <div class="team-name">

          <span class="team-logo">
            ${escapeHTML(
              game.away
                .slice(0,2)
                .toUpperCase()
            )}
          </span>

          ${escapeHTML(game.away)}

        </div>

        <div class="team-score">
          ${escapeHTML(game.as)}
        </div>

      </div>


      <div class="vs-line">
        VS
      </div>


      <div class="team-row">

        <div class="team-name">

          <span class="team-logo">
            ${escapeHTML(
              game.home
                .slice(0,2)
                .toUpperCase()
            )}
          </span>

          ${escapeHTML(game.home)}

        </div>

        <div class="team-score">
          ${escapeHTML(game.hs)}
        </div>

      </div>


      <div class="game-footer">

        <span>
          ${escapeHTML(game.venue)}
        </span>

        <span>
          ${
            game.live
              ? "● LIVE"
              : "GAME CENTER →"
          }
        </span>

      </div>

    </article>

  `;

}


function renderGames(games) {

  scoreboard.innerHTML =
    games.length

      ? games.map(gameCard).join("")

      : `

        <div class="loading-card">

          <p>
            Tidak ada pertandingan
            pada tanggal ini.
          </p>

        </div>

      `;


  gameCount.textContent =
    games.length;


  liveCount.textContent =
    games.filter(
      game => game.live
    ).length;


  finalCount.textContent =
    games.filter(
      game => game.status === "FINAL"
    ).length;


  upcomingCount.textContent =
    games.filter(
      game =>
        !game.live &&
        game.status !== "FINAL"
    ).length;


  lastUpdated.textContent =
    `UPDATE ${new Date().toLocaleTimeString("id-ID")}`;

}


function normalizeESPN(data) {

  return (data.events || []).map(event => {

    const comp =
      event.competitions?.[0];


    const competitors =
      comp?.competitors || [];


    const home =
      competitors.find(
        c => c.homeAway === "home"
      ) ||
      competitors[0];


    const away =
      competitors.find(
        c => c.homeAway === "away"
      ) ||
      competitors[1];


    const state =
      comp?.status?.type;


    const live =
      state?.state === "in";


    const status =

      live

        ? `LIVE • ${
            comp?.status?.displayClock ||
            state?.shortDetail ||
            "PLAY"
          }`

        : state?.completed

          ? "FINAL"

          : state?.shortDetail ||
            "UPCOMING";


    return {

      status,

      live,

      home:
        home?.team?.displayName ||
        "Home",

      away:
        away?.team?.displayName ||
        "Away",

      hs:
        home?.score ??
        "-",

      as:
        away?.score ??
        "-",

      venue:
        comp?.venue?.fullName ||
        "Arena"

    };

  });

}


async function loadScores() {

  refreshBtn.disabled = true;

  refreshBtn.textContent =
    "↻ Loading";


  try {

    const response =
      await fetch(
        API_URL,
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {
      throw new Error(
        "API unavailable"
      );
    }


    const data =
      await response.json();


    const games =
      normalizeESPN(data);


    renderGames(
      games.length
        ? games
        : demoGames
    );


    showToast(

      games.length

        ? "Live scoreboard diperbarui."

        : "Tidak ada game live, demo board ditampilkan."

    );


  } catch (error) {

    renderGames(
      demoGames
    );


    showToast(
      "Feed live tidak tersedia. Menampilkan data demo."
    );


  } finally {

    refreshBtn.disabled = false;

    refreshBtn.textContent =
      "↻ Refresh";

  }

}


function showToast(message) {

  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    window.toastTimer
  );


  window.toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 2800);

}


refreshBtn.addEventListener(
  "click",
  loadScores
);


document
  .querySelectorAll(".date-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".date-btn")
          .forEach(b =>
            b.classList.remove(
              "active"
            )
          );


        button.classList.add(
          "active"
        );


        const day =
          Number(
            button.dataset.day
          );


        if (day === 0) {

          loadScores();

          return;

        }


        renderGames(

          demoGames.map(
            (game, index) => ({

              ...game,

              status:

                day < 0

                  ? "FINAL"

                  : (
                      index % 2
                        ? "TOMORROW • 20:00"
                        : "TOMORROW • 19:30"
                    ),

              live: false,

              hs:

                day < 0
                  ? index + 94
                  : "-",

              as:

                day < 0
                  ? index + 89
                  : "-"

            })
          )

        );


        showToast(

          day < 0

            ? "Menampilkan ringkasan kemarin."

            : "Menampilkan jadwal besok."

        );

      }
    );

  });


document
  .querySelectorAll(".mini-tab")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".mini-tab")
          .forEach(
            b =>
              b.classList.remove(
                "active"
              )
          );


        button.classList.add(
          "active"
        );


        const type =
          button.dataset.stat;


        const values = {

          points:
            [
              31.4,
              29.8,
              28.6,
              27.9
            ],

          rebounds:
            [
              13.2,
              12.7,
              12.1,
              11.8
            ],

          assists:
            [
              11.4,
              10.8,
              10.1,
              9.7
            ]

        };


        document
          .querySelectorAll(
            ".leader-value b"
          )
          .forEach(
            (element, index) => {

              element.textContent =
                values[type][index];

            }
          );


        document
          .querySelectorAll(
            ".leader-value small"
          )
          .forEach(
            element => {

              element.textContent =

                type === "points"

                  ? "PPG"

                  : type === "rebounds"

                    ? "RPG"

                    : "APG";

            }
          );

      }
    );

  });


document
  .querySelectorAll(".conf-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".conf-btn")
          .forEach(
            b =>
              b.classList.remove(
                "active"
              )
          );


        button.classList.add(
          "active"
        );


        showToast(
          `${button.textContent} conference dipilih.`
        );

      }
    );

  });


document
  .querySelectorAll(".main-nav a")
  .forEach(link => {

    link.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(
            ".main-nav a"
          )
          .forEach(
            a =>
              a.classList.remove(
                "active"
              )
          );


        link.classList.add(
          "active"
        );


        document
          .getElementById(
            "mainNav"
          )
          .classList.remove(
            "open"
          );

      }
    );

  });


document
  .getElementById("menuBtn")
  .addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "mainNav"
        )
        .classList.toggle(
          "open"
        );

    }
  );


document
  .getElementById("themeBtn")
  .addEventListener(
    "click",
    () => {

      document.body.classList.toggle(
        "light"
      );


      const mode =
        document.body.classList.contains(
          "light"
        )
          ? "light"
          : "dark";


      localStorage.setItem(
        "hoopzone-theme",
        mode
      );


      showToast(
        mode === "light"
          ? "Light mode aktif."
          : "Dark mode aktif."
      );

    }
  );


if (
  localStorage.getItem(
    "hoopzone-theme"
  ) === "light"
) {

  document.body.classList.add(
    "light"
  );

}


const searchPanel =
  document.getElementById(
    "searchPanel"
  );


document
  .getElementById("searchBtn")
  .addEventListener(
    "click",
    () => {

      searchPanel.classList.add(
        "open"
      );


      document
        .getElementById(
          "siteSearch"
        )
        .focus();

    }
  );


document
  .getElementById("closeSearch")
  .addEventListener(
    "click",
    () => {

      searchPanel.classList.remove(
        "open"
      );

    }
  );


document
  .getElementById("doSearch")
  .addEventListener(
    "click",
    runSearch
  );


document
  .getElementById("siteSearch")
  .addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        runSearch();

      }

    }
  );


function runSearch() {

  const query =
    document
      .getElementById(
        "siteSearch"
      )
      .value
      .trim();


  const result =
    document.getElementById(
      "searchResult"
    );


  if (!query) {

    result.textContent =
      "Masukkan nama tim atau pemain.";

    return;

  }


  const names = [

    "Metro Wolves",

    "Coast Giants",

    "Capital Force",

    "Lake City",

    "Jalen Carter",

    "Marcus Reed"

  ];


  const found =
    names.filter(
      name =>
        name
          .toLowerCase()
          .includes(
            query.toLowerCase()
          )
    );


  result.innerHTML =

    found.length

      ? `Ditemukan:
         <strong>
         ${found
           .map(escapeHTML)
           .join(", ")}
         </strong>`

      : `Tidak ada hasil untuk
         <strong>
         ${escapeHTML(query)}
         </strong>.
         Coba kata kunci lain.`;

}


document
  .getElementById("notifyBtn")
  .addEventListener(
    "click",
    () => {

      showToast(
        "Update basket akan muncul di dashboard."
      );

    }
  );


setInterval(
  () => {

    if (
      document.visibilityState ===
      "visible"
    ) {

      loadScores();

    }

  },
  30000
);


loadScores();
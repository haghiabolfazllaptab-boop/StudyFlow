/* =========================================================
   STUDYFLOW
   Progressive Web App - Service Worker
   Version: 1.0.0
========================================================= */

"use strict";


/* =========================================================
   01. CACHE CONFIGURATION
========================================================= */

const CACHE_NAME = "studyflow-v1.0.0";

const RUNTIME_CACHE = "studyflow-runtime-v1";

const OFFLINE_PAGE = "./index.html";


/*
 * فایل‌های اصلی برنامه
 */
const APP_SHELL = [

    "./",

    "./index.html",

    "./style.css",

    "./app.js",

    "./manifest.json",

    "./icons/icon-72.png",

    "./icons/icon-96.png",

    "./icons/icon-128.png",

    "./icons/icon-144.png",

    "./icons/icon-152.png",

    "./icons/icon-192.png",

    "./icons/icon-384.png",

    "./icons/icon-512.png",

    "./icons/icon-512-maskable.png"

];


/* =========================================================
   02. INSTALL
========================================================= */

self.addEventListener(
    "install",
    event => {

        console.log(
            "[StudyFlow SW] Installing..."
        );


        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(cache => {

                    console.log(
                        "[StudyFlow SW] Caching app shell..."
                    );


                    return cache.addAll(
                        APP_SHELL
                    );

                })
                .then(() => {

                    console.log(
                        "[StudyFlow SW] App shell cached."
                    );


                    /*
                     * باعث می‌شود Service Worker
                     * جدید سریعاً فعال شود.
                     */

                    return self.skipWaiting();

                })
                .catch(error => {

                    console.error(
                        "[StudyFlow SW] Cache error:",
                        error
                    );

                })

        );

    }
);


/* =========================================================
   03. ACTIVATE
========================================================= */

self.addEventListener(
    "activate",
    event => {

        console.log(
            "[StudyFlow SW] Activating..."
        );


        event.waitUntil(

            caches
                .keys()
                .then(cacheNames => {

                    return Promise.all(

                        cacheNames
                            .filter(
                                cacheName => {

                                    return (

                                        cacheName !==
                                        CACHE_NAME

                                        &&

                                        cacheName !==
                                        RUNTIME_CACHE

                                    );

                                }
                            )
                            .map(
                                cacheName => {

                                    console.log(
                                        "[StudyFlow SW] Removing old cache:",
                                        cacheName
                                    );


                                    return caches.delete(
                                        cacheName
                                    );

                                }
                            )

                    );

                })
                .then(() => {

                    console.log(
                        "[StudyFlow SW] Activated."
                    );


                    /*
                     * کنترل صفحات باز
                     * بدون نیاز به Refresh
                     */

                    return self.clients.claim();

                })

        );

    }
);


/* =========================================================
   04. FETCH
========================================================= */

self.addEventListener(
    "fetch",
    event => {

        /*
         * فقط درخواست‌های GET
         */

        if (
            event.request.method !== "GET"
        ) {

            return;

        }


        const request =
            event.request;


        /*
         * درخواست‌های Navigation
         * مثل باز کردن index.html
         */

        if (
            request.mode === "navigate"
        ) {

            event.respondWith(

                fetch(request)

                    .then(response => {

                        /*
                         * اگر اینترنت موجود بود،
                         * نسخه جدید صفحه را ذخیره کن.
                         */

                        if (
                            response &&
                            response.status === 200
                        ) {

                            const responseClone =
                                response.clone();


                            caches
                                .open(RUNTIME_CACHE)
                                .then(cache => {

                                    cache.put(
                                        request,
                                        responseClone
                                    );

                                });

                        }


                        return response;

                    })

                    .catch(() => {

                        /*
                         * اگر اینترنت قطع بود،
                         * نسخه Cache شده را نمایش بده.
                         */

                        return caches.match(
                            request
                        )

                        .then(cachedResponse => {

                            if (
                                cachedResponse
                            ) {

                                return cachedResponse;

                            }


                            return caches.match(
                                OFFLINE_PAGE
                            );

                        });

                    })

            );

            return;

        }


        /*
         * سایر فایل‌ها
         */

        event.respondWith(

            caches.match(request)

                .then(cachedResponse => {

                    /*
                     * اگر فایل در Cache بود،
                     * همان را برگردان.
                     */

                    if (
                        cachedResponse
                    ) {

                        /*
                         * برای فایل‌های محلی
                         * Cache First مناسب است.
                         */

                        return cachedResponse;

                    }


                    /*
                     * اگر Cache نبود،
                     * از اینترنت دریافت کن.
                     */

                    return fetch(request)

                        .then(response => {

                            /*
                             * پاسخ معتبر را ذخیره کن.
                             */

                            if (
                                response &&
                                response.status === 200 &&
                                response.type !== "opaque"
                            ) {

                                const responseClone =
                                    response.clone();


                                caches
                                    .open(
                                        RUNTIME_CACHE
                                    )
                                    .then(cache => {

                                        cache.put(
                                            request,
                                            responseClone
                                        );

                                    });

                            }


                            return response;

                        })

                        .catch(() => {

                            /*
                             * اگر فایل پیدا نشد،
                             * پاسخ آفلاین مناسب.
                             */

                            return new Response(

                                `

                                <!DOCTYPE html>

                                <html lang="fa" dir="rtl">

                                <head>

                                    <meta charset="UTF-8">

                                    <meta
                                        name="viewport"
                                        content="width=device-width, initial-scale=1.0"
                                    >

                                    <title>
                                        StudyFlow
                                    </title>

                                    <style>

                                        body {

                                            margin: 0;

                                            min-height: 100vh;

                                            display: flex;

                                            align-items: center;

                                            justify-content: center;

                                            font-family:
                                                system-ui,
                                                sans-serif;

                                            background:
                                                #f8f7ff;

                                            color:
                                                #202027;

                                            text-align:
                                                center;

                                        }

                                        .offline {

                                            max-width:
                                                420px;

                                            padding:
                                                30px;

                                        }

                                        .icon {

                                            font-size:
                                                60px;

                                            margin-bottom:
                                                20px;

                                        }

                                        h1 {

                                            margin-bottom:
                                                10px;

                                        }

                                        p {

                                            line-height:
                                                1.9;

                                            color:
                                                #666;

                                        }

                                        button {

                                            border: 0;

                                            padding:
                                                12px 22px;

                                            border-radius:
                                                12px;

                                            background:
                                                #6c5ce7;

                                            color:
                                                white;

                                            cursor:
                                                pointer;

                                            font-size:
                                                15px;

                                        }

                                    </style>

                                </head>

                                <body>

                                    <div class="offline">

                                        <div class="icon">
                                            📚
                                        </div>

                                        <h1>
                                            StudyFlow
                                        </h1>

                                        <p>
                                            اتصال اینترنت برقرار نیست،
                                            اما می‌توانید بعداً دوباره تلاش کنید.
                                        </p>

                                        <button
                                            onclick="location.reload()"
                                        >
                                            تلاش مجدد
                                        </button>

                                    </div>

                                </body>

                                </html>

                                `,

                                {

                                    status: 503,

                                    headers: {

                                        "Content-Type":
                                            "text/html; charset=UTF-8"

                                    }

                                }

                            );

                        });

                })

        );

    }
);


/* =========================================================
   05. MESSAGE HANDLER
========================================================= */

self.addEventListener(
    "message",
    event => {

        if (
            !event.data
        ) {

            return;

        }


        /*
         * درخواست Skip Waiting
         */

        if (
            event.data.type ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }


        /*
         * پاک کردن Cache
         */

        if (
            event.data.type ===
            "CLEAR_CACHE"
        ) {

            event.waitUntil(

                caches
                    .keys()
                    .then(cacheNames => {

                        return Promise.all(

                            cacheNames.map(
                                cacheName =>
                                    caches.delete(
                                        cacheName
                                    )
                            )

                        );

                    })

            );

        }

    }
);


/* =========================================================
   06. PUSH NOTIFICATIONS
========================================================= */

self.addEventListener(
    "push",
    event => {

        let data = {

            title:
                "StudyFlow",

            body:
                "وقت مطالعه فرا رسیده! 📚",

            icon:
                "./icons/icon-192.png",

            badge:
                "./icons/icon-72.png"

        };


        /*
         * اگر Push Notification
         * اطلاعاتی همراه خود داشت
         */

        if (
            event.data
        ) {

            try {

                data = {

                    ...data,

                    ...event.data.json()

                };

            } catch {

                console.warn(
                    "[StudyFlow SW] Invalid push data."
                );

            }

        }


        const options = {

            body:
                data.body,

            icon:
                data.icon,

            badge:
                data.badge,

            dir:
                "rtl",

            lang:
                "fa",

            vibrate:
                [
                    100,
                    50,
                    100
                ],

            data: {

                url:
                    "./index.html"

            }

        };


        event.waitUntil(

            self.registration.showNotification(

                data.title,

                options

            )

        );

    }
);


/* =========================================================
   07. NOTIFICATION CLICK
========================================================= */

self.addEventListener(
    "notificationclick",
    event => {

        event.notification.close();


        const targetUrl =
            event.notification?.data?.url ||
            "./index.html";


        event.waitUntil(

            self.clients
                .matchAll({

                    type:
                        "window",

                    includeUncontrolled:
                        true

                })

                .then(clients => {

                    /*
                     * اگر StudyFlow
                     * قبلاً باز باشد
                     */

                    for (
                        const client of clients
                    ) {

                        if (
                            "focus" in client
                        ) {

                            client.navigate(
                                targetUrl
                            );

                            return client.focus();

                        }

                    }


                    /*
                     * در غیر این صورت
                     * پنجره جدید باز کن.
                     */

                    if (
                        self.clients.openWindow
                    ) {

                        return self.clients.openWindow(
                            targetUrl
                        );

                    }

                })

        );

    }
);


/* =========================================================
   08. BACKGROUND SYNC
========================================================= */

self.addEventListener(
    "sync",
    event => {

        if (
            event.tag ===
            "studyflow-sync"
        ) {

            event.waitUntil(
                syncStudyFlowData()
            );

        }

    }
);


async function syncStudyFlowData() {

    console.log(
        "[StudyFlow SW] Background sync executed."
    );

    /*
     * در نسخه فعلی اطلاعات اصلی
     * داخل LocalStorage مدیریت می‌شود.
     *
     * در آینده می‌توان این قسمت را
     * به Firebase / Supabase / API
     * متصل کرد.
     */

}


/* =========================================================
   09. PERIODIC BACKGROUND SYNC
========================================================= */

self.addEventListener(
    "periodicsync",
    event => {

        if (
            event.tag ===
            "studyflow-daily"
        ) {

            event.waitUntil(
                dailyStudyReminder()
            );

        }

    }
);


async function dailyStudyReminder() {

    console.log(
        "[StudyFlow SW] Daily background task."
    );

}


/* =========================================================
   10. SERVICE WORKER READY
========================================================= */

console.log(
    "%c StudyFlow Service Worker ",
    "background:#6c5ce7;color:white;padding:8px;border-radius:8px;font-weight:bold"
);

console.log(
    "[StudyFlow SW] Service Worker loaded successfully 🚀"
);
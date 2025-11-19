import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { urls } = await request.json();

        if (!urls || !Array.isArray(urls)) {
            return NextResponse.json({ error: 'Invalid URLs provided' }, { status: 400 });
        }

        const results = await Promise.all(
            urls.map(async (url) => {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

                    const response = await fetch(url, {
                        method: 'HEAD', // Try HEAD first for speed
                        signal: controller.signal,
                        headers: {
                            'User-Agent': 'PDFLinkChecker/1.0'
                        }
                    });

                    clearTimeout(timeoutId);

                    // If HEAD fails with 405 (Method Not Allowed), try GET
                    if (response.status === 405) {
                        const controllerGet = new AbortController();
                        const timeoutIdGet = setTimeout(() => controllerGet.abort(), 5000);

                        const responseGet = await fetch(url, {
                            method: 'GET',
                            signal: controllerGet.signal,
                            headers: {
                                'User-Agent': 'PDFLinkChecker/1.0'
                            }
                        });
                        clearTimeout(timeoutIdGet);
                        return { url, status: responseGet.status };
                    }

                    return { url, status: response.status };
                } catch (error) {
                    console.error(`Error checking ${url}:`, error);
                    return { url, status: 0 }; // 0 indicates network error/timeout
                }
            })
        );

        return NextResponse.json({ results });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

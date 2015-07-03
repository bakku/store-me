package programmierprojekt.fhws.marcelgross.storeme;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import programmierprojekt.fhws.marcelgross.storeme.Adapter.ActivityRegistry;
import programmierprojekt.fhws.marcelgross.storeme.Adapter.MyDBHandler;


public class ResultActivity extends Activity {

    private String result1, result2, url;
    private ActivityRegistry ar = ActivityRegistry.getInstance();

    @SuppressLint("JavascriptInterface")
    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);
        setContentView(R.layout.webview);
        ar.register(this);

        Intent intent = getIntent();
        if (intent.getStringArrayExtra("url") != null){
            url = intent.getStringExtra("url");
            Log.wtf("url", url);
        }
        result1 = intent.getStringExtra("result1");
        result2 = intent.getStringExtra("result2");


        final WebView browser = (WebView) findViewById(R.id.webView);
        browser.getSettings().setJavaScriptEnabled(true);
        browser.getSettings().setLoadsImagesAutomatically(true);
        browser.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
        browser.addJavascriptInterface(new Object() {

            @JavascriptInterface
            public void performClick() {
                Intent intent = new Intent(ResultActivity.this, ScannerActivity.class);
                intent.putExtra("Scan", 1);
                intent.putExtra("result1", result1);
                intent.putExtra("result2", result2);
                intent.putExtra("url", browser.getUrl());
                startActivity(intent);
            }
        }, "scan");
        browser.addJavascriptInterface(new Object() {

            @JavascriptInterface
            public void performClick() {
                Intent intent = new Intent(ResultActivity.this, ScannerActivity.class);
                intent.putExtra("Scan", 2);
                intent.putExtra("result1", result1);
                intent.putExtra("result2", result2);
                intent.putExtra("url", browser.getUrl());
                startActivity(intent);
            }
        }, "scan2");

        browser.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (!result1.isEmpty())
                    view.loadUrl("javascript:getScanResult(\"" + result1 + "\", \"item-id-stock\")");
                if (!result2.isEmpty())
                    view.loadUrl("javascript:getScanResult(\"" + result2 + "\", \"container-id-stock\")");
            }
        });

        browser.loadUrl(url);
        url = browser.getUrl();
    }

    @Override
    public void onBackPressed() {
       Intent intent = new Intent(getApplicationContext(), MainActivity.class);
        startActivity(intent);
    }
}

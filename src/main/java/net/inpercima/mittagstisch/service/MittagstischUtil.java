package net.inpercima.mittagstisch.service;

import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalField;
import java.time.temporal.WeekFields;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gargoylesoftware.htmlunit.BrowserVersion;
import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.WebClientOptions;
import com.gargoylesoftware.htmlunit.WebRequest;
import com.gargoylesoftware.htmlunit.html.HtmlPage;

import net.inpercima.mittagstisch.model.Lunch;

public class MittagstischUtil {

    private static final int IN_NEXT_WEEK = 7;

    private static final String NEXT_WEEK = "Der Speiseplan scheint schon für nächste Woche vorgegeben. Bitte unter 'nächste Woche' schauen.";

    private static final Logger LOGGER = LoggerFactory.getLogger(MittagstischUtil.class);

    private static final String OUTDATED = "Der Speiseplan scheint nicht mehr aktuell zu sein. Bitte prüfe manuell: <a href='%s' target='_blank'>%s</>";

    protected static final String STATUS_ERROR = "status-error";

    protected static final String STATUS_SUCCESS = "status-success";

    protected static final String STATUS_WARNING = "status-warning";

    protected static final String TECHNICAL = "Derzeit kann aufgrund einer technische Besonderheit keine Information zur Karte eingeholt werden. Bitte prüfe manuell: <a href='%s' target='_blank'>%s</>";

    private static final String DATE_FORMAT = "dd.MM.YYYY";

    private static final DateTimeFormatter LOGGER_FORMAT = DateTimeFormatter.ofPattern(DATE_FORMAT);

    private MittagstischUtil() {
        // not used
    }

    /**
     * Determine the page to get information of the lunch.
     *
     * @param url The URL of the page which should be parsed
     * @return HtmlPage The page which should be parsed
     */
    public static HtmlPage getHtmlPage(final String url) throws IOException {
        final WebRequest request = new WebRequest(new URL(url));
        request.setCharset(StandardCharsets.UTF_8);
        return initWebClient().getPage(request);
    }

    /**
     * Init webclient with firefox browser and some options.
     *
     * @return WebClient The initialized client
     */
    private static WebClient initWebClient() {
        final WebClient webClient = new WebClient(BrowserVersion.FIREFOX_52);
        final WebClientOptions options = webClient.getOptions();
        options.setJavaScriptEnabled(true);
        options.setUseInsecureSSL(true);
        options.setThrowExceptionOnScriptError(true);
        options.setThrowExceptionOnFailingStatusCode(true);
        return webClient;
    }

    /**
     * Determine the information of the week.
     * 
     * @param selector The selector to the inforamtion of week
     * @param page The page to be parsed
     * @return String The content including week information
     */
    public static String getWeek(final String selector, final HtmlPage page) {
        return page.querySelector(selector).getTextContent().replaceAll(" ", "");
    }

    /**
     * Checks if the dates in the determined week are up-to-date.
     * 
     * @param weekText The determined information of week.
     * @param days Days added to this day.
     * @return boolean True if up-to-date otherwise false
     */
    protected static boolean isInWeek(final String weekText, final int days) {
        final LocalDate now = getLocalizedDate(days);
        final LocalDate firstDay = now.with(dayOfWeek(), 1);
        final LocalDate lastDay = now.with(dayOfWeek(), 5);

        final DateTimeFormatter d = DateTimeFormatter.ofPattern("d.", Locale.GERMANY);
        final DateTimeFormatter dMM = DateTimeFormatter.ofPattern("d.MM", Locale.GERMANY);
        final DateTimeFormatter dMMMM = DateTimeFormatter.ofPattern("d.MMMM", Locale.GERMANY);
        final DateTimeFormatter ddMMMMYYYY = DateTimeFormatter.ofPattern("dd.MMMMYYYY", Locale.GERMANY);

        final int weekNumber = now.get(WeekFields.of(Locale.GERMANY).weekOfYear());

        final String formatFirsDay = firstDay.format(LOGGER_FORMAT);
        LOGGER.debug("first day in week '{}'", formatFirsDay);
        final String formatLastDay = lastDay.format(LOGGER_FORMAT);
        LOGGER.debug("last day in week '{}'", formatLastDay);

        final boolean kaiserbad = weekText.contains(firstDay.format(d))
                && weekText.contains(lastDay.format(ddMMMMYYYY));
        final boolean kantine3 = weekText.contains(firstDay.format(dMMMM).toUpperCase())
                && weekText.contains(lastDay.format(dMMMM).toUpperCase());
        final boolean pan = weekText.contains(String.valueOf(weekNumber))
                && (weekText.contains("KW") || weekText.contains("KARTE"));
        final boolean wullewupp = weekText.contains(firstDay.format(dMM)) && weekText.contains(lastDay.format(dMM));
        final boolean isInweek = lastDay.isAfter(getLocalDate()) && (kaiserbad || kantine3 || pan || wullewupp);
        LOGGER.debug("is in week: '{}'", isInweek);

        return isInweek;
    }

    /**
     * Prepares a lunch with some predefined texts if needed.
     * 
     * @param page The page to be parsed
     * @param name The page name
     * @param selectorWeek The css selector for the week of the page
     * @param url The url of the page
     * @param daily True if the lunch is per day otherwise false
     * @param days True if the lunch is for this day otherwise false (tomorrow)
     * @return String
     */
    protected static Lunch prepareLunch(final HtmlPage page, final String name, final String selectorWeek,
            final String url, final boolean daily, final int days) {
        final Lunch lunch = new Lunch(name);
        final String weekText = MittagstischUtil.getWeek(selectorWeek, page);
        LOGGER.debug("prepare lunch for '{}' with weektext '{}'", name, weekText);
        if (!MittagstischUtil.isInWeek(weekText, days) && !MittagstischUtil.isInWeek(weekText, IN_NEXT_WEEK)) {
            lunch.setFood(String.format(OUTDATED, url, url));
            lunch.setStatus(STATUS_ERROR);
        } else if (MittagstischUtil.isInWeek(weekText, IN_NEXT_WEEK) && daily && days == 0) {
            lunch.setFood(NEXT_WEEK);
            lunch.setStatus(STATUS_WARNING);
        }
        return lunch;
    }

    protected static TemporalField dayOfWeek() {
        return WeekFields.of(Locale.GERMANY).dayOfWeek();
    }

    private static LocalDate getLocalDate() {
        final LocalDate now = LocalDate.now(ZoneId.of("Europe/Berlin"));
        final String format = now.format(LOGGER_FORMAT);
        LOGGER.debug("current date: '{}'", format);
        return now;
    }

    /**
     * @param days True if the lunch is for this day otherwise false (tomorrow)
     * @return LocalDate
     */
    protected static LocalDate getLocalizedDate(final int days) {
        final LocalDate now = getLocalDate().plusDays(days);
        final String format = now.format(LOGGER_FORMAT);
        LOGGER.debug("used date for weekcheck: '{}'", format);
        return now;
    }

}

import javax.swing.*;
import java.awt.*;
import java.awt.print.*;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * WiFi QR Code Generator - Single file implementation
 * Generates QR codes for WiFi credentials using SRP and DRY principles
 */

// ============================================================================
// Data Model
// ============================================================================
class WiFiCredentials {
    private final String ssid;
    private final String password;

    WiFiCredentials(String ssid, String password) {
        this.ssid = ssid;
        this.password = password;
    }

    String getSsid() {
        return ssid;
    }

    String getPassword() {
        return password;
    }
}

// ============================================================================
// Formatters & Generators
// ============================================================================
class WiFiQRFormatter {
    private static final String WIFI_QR_PREFIX = "WIFI:";
    private static final String SECURITY_TYPE = "T:WPA";
    private static final String SSID_PREFIX = "S:";
    private static final String PASSWORD_PREFIX = "P:";
    private static final String TERMINATOR = ";;";

    String format(WiFiCredentials credentials) {
        return String.format("%s%s;%s%s;%s%s%s",
                WIFI_QR_PREFIX,
                SECURITY_TYPE,
                SSID_PREFIX,
                credentials.getSsid(),
                PASSWORD_PREFIX,
                credentials.getPassword(),
                TERMINATOR);
    }
}

class QRCodeGenerator {
    private static final String QR_API_BASE = "https://api.qrserver.com/v1/create-qr-code/";
    private static final int DEFAULT_SIZE = 164;

    String generateQRCodeUrl(String data, int size) {
        try {
            String encodedData = URLEncoder.encode(data, StandardCharsets.UTF_8.name());
            return String.format("%s?size=%dx%d&data=%s", QR_API_BASE, size, size, encodedData);
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to generate QR code URL", e);
        }
    }

    String generateQRCodeUrl(String data) {
        return generateQRCodeUrl(data, DEFAULT_SIZE);
    }
}

// ============================================================================
// Main Application
// ============================================================================
public class WifiQR extends JFrame {
    private final JTextField ssidField;
    private final JPasswordField passwordField;
    private final JLabel qrLabel;
    private final WiFiQRFormatter formatter = new WiFiQRFormatter();
    private final QRCodeGenerator generator = new QRCodeGenerator();
    private final ImageIcon placeholderIcon;

    public WifiQR() {
        setTitle("WiFi QR Code Generator");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setResizable(false);
        setLocationRelativeTo(null);

        // Create placeholder icon
        placeholderIcon = createPlaceholderIcon(164, 164);

        // Main panel
        JPanel mainPanel = new JPanel();
        mainPanel.setBorder(BorderFactory.createDashedBorder(Color.LIGHT_GRAY, 2, 5));
        mainPanel.setLayout(new BoxLayout(mainPanel, BoxLayout.X_AXIS));
        mainPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // QR Code label
        qrLabel = new JLabel(placeholderIcon);

        // Input panel
        JPanel inputPanel = new JPanel();
        inputPanel.setLayout(new BoxLayout(inputPanel, BoxLayout.Y_AXIS));
        inputPanel.setBorder(BorderFactory.createEmptyBorder(0, 20, 0, 0));

        JLabel titleLabel = new JLabel("WiFi Login");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 16));
        inputPanel.add(titleLabel);
        inputPanel.add(Box.createVerticalStrut(15));

        // SSID input
        JLabel ssidLabel = new JLabel("Network name");
        ssidField = new JTextField("", 15);
        ssidField.setMaximumSize(new Dimension(250, 35));
        ssidField.addKeyListener(new java.awt.event.KeyAdapter() {
            @Override
            public void keyReleased(java.awt.event.KeyEvent e) {
                updateQRCode();
            }
        });
        inputPanel.add(ssidLabel);
        inputPanel.add(ssidField);
        inputPanel.add(Box.createVerticalStrut(10));

        // Password input
        JLabel passwordLabel = new JLabel("Password");
        passwordField = new JPasswordField("", 15);
        passwordField.setMaximumSize(new Dimension(250, 35));
        passwordField.addKeyListener(new java.awt.event.KeyAdapter() {
            @Override
            public void keyReleased(java.awt.event.KeyEvent e) {
                updateQRCode();
            }
        });
        inputPanel.add(passwordLabel);
        inputPanel.add(passwordField);
        inputPanel.add(Box.createVerticalStrut(20));

        // Print button
        JButton printButton = new JButton("Print WiFi Card");
        printButton.setMaximumSize(new Dimension(250, 40));
        printButton.addActionListener(e -> printWiFiCard());
        inputPanel.add(printButton);
        inputPanel.add(Box.createVerticalGlue());

        // Info label
        JLabel infoLabel = new JLabel("📸 Point your phone's camera at the QR code to connect to WiFi");
        infoLabel.setFont(new Font("Arial", Font.PLAIN, 11));
        inputPanel.add(infoLabel);

        // Add panels to main
        mainPanel.add(qrLabel);
        mainPanel.add(inputPanel);

        add(mainPanel);
        setSize(500, 250);
    }

    private void updateQRCode() {
        String ssid = ssidField.getText();
        String password = new String(passwordField.getPassword());

        if (!ssid.isEmpty() || !password.isEmpty()) {
            WiFiCredentials credentials = new WiFiCredentials(ssid, password);
            String qrData = formatter.format(credentials);
            String qrUrl = generator.generateQRCodeUrl(qrData);

            try {
                ImageIcon icon = new ImageIcon(new java.net.URI(qrUrl).toURL());
                qrLabel.setIcon(icon);
            } catch (MalformedURLException | URISyntaxException e) {
                qrLabel.setIcon(placeholderIcon);
            }
        } else {
            qrLabel.setIcon(placeholderIcon);
        }
    }

    private ImageIcon createPlaceholderIcon(int width, int height) {
        java.awt.image.BufferedImage img = new java.awt.image.BufferedImage(width, height, java.awt.image.BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = img.createGraphics();
        g2d.setColor(Color.LIGHT_GRAY);
        g2d.fillRect(0, 0, width, height);
        g2d.setColor(Color.DARK_GRAY);
        g2d.drawString("QR Code", width / 2 - 20, height / 2);
        g2d.dispose();
        return new ImageIcon(img);
    }

    private void printWiFiCard() {
        try {
            PrinterJob printerJob = PrinterJob.getPrinterJob();
            printerJob.setPrintable((graphics, pageFormat, pageIndex) -> {
                if (pageIndex > 0) {
                    return Printable.NO_SUCH_PAGE;
                }
                Graphics2D g2d = (Graphics2D) graphics;
                g2d.translate(pageFormat.getImageableX(), pageFormat.getImageableY());
                print(g2d);
                return Printable.PAGE_EXISTS;
            });
            if (printerJob.printDialog()) {
                printerJob.print();
            }
        } catch (PrinterException e) {
            JOptionPane.showMessageDialog(this, "Print failed: " + e.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            WifiQR frame = new WifiQR();
            frame.setVisible(true);
        });
    }
}

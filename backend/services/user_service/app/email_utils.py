import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def send_email(
    subject: str, 
    body: str, 
    to_email: str, 
    from_email: Optional[str] = None, 
    smtp_server: str = 'smtp.gmail.com', 
    smtp_port: int = 587, 
    smtp_user: Optional[str] = None, 
    smtp_password: Optional[str] = None, 
    html_body: Optional[str] = None,
    cc: Optional[List[str]] = None,
    bcc: Optional[List[str]] = None
):
    """
    Fonction pour envoyer un email via SMTP
    
    Parameters:
        subject: Sujet de l'email
        body: Corps de l'email en texte brut
        to_email: Destinataire
        from_email: Expéditeur (si différent de smtp_user)
        smtp_server: Serveur SMTP
        smtp_port: Port SMTP
        smtp_user: Nom d'utilisateur SMTP
        smtp_password: Mot de passe SMTP (utiliser un mot de passe d'application pour Gmail)
        html_body: Corps de l'email en HTML (optionnel)
        cc: Liste d'adresses en copie
        bcc: Liste d'adresses en copie cachée
    """
    logger.info(f"Préparation d'un email à {to_email} avec le sujet '{subject}'")
    
    msg = MIMEMultipart('alternative')
    msg['From'] = from_email or smtp_user or 'noreply@example.com'
    msg['To'] = to_email
    msg['Subject'] = subject
    
    if cc:
        msg['Cc'] = ", ".join(cc)
    
    # Ajout du corps en texte brut comme fallback
    msg.attach(MIMEText(body, 'plain'))
    
    # Si un corps HTML est fourni, on l'ajoute aussi
    if html_body:
        msg.attach(MIMEText(html_body, 'html'))
    
    # Préparation de tous les destinataires pour l'envoi
    recipients = [to_email]
    if cc:
        recipients.extend(cc)
    if bcc:
        recipients.extend(bcc)
    
    try:
        logger.info(f"Connexion au serveur SMTP {smtp_server}:{smtp_port}")
        context = ssl.create_default_context()
        
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            # La plupart des serveurs SMTP nécessitent TLS
            server.starttls(context=context)
            
            if smtp_user and smtp_password:
                logger.info(f"Tentative d'authentification pour {smtp_user}")
                try:
                    server.login(smtp_user, smtp_password)
                    logger.info("Authentification réussie")
                except smtplib.SMTPAuthenticationError as e:
                    logger.error(f"Échec de l'authentification SMTP: {e}")
                    error_msg = str(e)
                    if "BadCredentials" in error_msg:
                        logger.error("Conseil: Pour Gmail, utilisez un mot de passe d'application généré sur https://myaccount.google.com/apppasswords")
                    raise
            
            logger.info(f"Envoi de l'email à {recipients}")
            server.sendmail(msg['From'], recipients, msg.as_string())
            logger.info("Email envoyé avec succès")
            
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi de l'email: {e}")
        raise

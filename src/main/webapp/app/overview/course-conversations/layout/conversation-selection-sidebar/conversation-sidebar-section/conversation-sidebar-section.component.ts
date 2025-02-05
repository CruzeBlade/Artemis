import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef, ViewEncapsulation } from '@angular/core';
import { faChevronRight, faMessage } from '@fortawesome/free-solid-svg-icons';
import { ConversationDto } from 'app/entities/metis/conversation/conversation.model';
import { ConversationService } from 'app/shared/metis/conversations/conversation.service';
import { getAsChannelDto } from 'app/entities/metis/conversation/channel.model';
import { Course } from 'app/entities/course.model';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
    selector: 'jhi-conversation-sidebar-section',
    templateUrl: './conversation-sidebar-section.component.html',
    styleUrls: ['./conversation-sidebar-section.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ConversationSidebarSectionComponent implements OnInit {
    @Output() conversationSelected = new EventEmitter<ConversationDto>();

    @Output()
    settingsChanged = new EventEmitter<void>();

    @Output()
    conversationHiddenStatusChange = new EventEmitter<void>();

    @Output()
    conversationFavoriteStatusChange = new EventEmitter<void>();

    @Input()
    label: string;

    @Input()
    course: Course;

    @Input()
    activeConversation?: ConversationDto;

    @Input() headerKey: string;

    readonly prefix = 'collapsed.';

    @Input()
    set conversations(conversations: ConversationDto[]) {
        this.hiddenConversations = [];
        this.visibleConversations = [];
        this.allConversations = conversations ?? [];
        conversations.forEach((conversation) => {
            if (conversation.isHidden) {
                this.hiddenConversations.push(conversation);
            } else {
                this.visibleConversations.push(conversation);
            }
        });
        this.numberOfConversations = this.allConversations.length;
    }

    get anyConversationUnread(): boolean {
        // do not show unread badge for open conversation that the user is currently reading
        let containsUnreadConversation = false;
        for (const conversation of this.allConversations) {
            if (
                conversation.unreadMessagesCount &&
                conversation.unreadMessagesCount > 0 &&
                !(this.activeConversation && this.activeConversation.id === conversation.id) &&
                this.isCollapsed
            ) {
                containsUnreadConversation = true;
                break;
            }
        }
        return containsUnreadConversation;
    }

    get anyHiddenConversationUnread(): boolean {
        // do not show unread badge for open conversation that the user is currently reading
        let containsUnreadConversation = false;
        for (const conversation of this.hiddenConversations) {
            if (
                conversation.unreadMessagesCount &&
                conversation.unreadMessagesCount > 0 &&
                !(this.activeConversation && this.activeConversation.id === conversation.id) &&
                !this.showHiddenConversations
            ) {
                containsUnreadConversation = true;
                break;
            }
        }
        return containsUnreadConversation;
    }

    isCollapsed: boolean;
    @ContentChild(TemplateRef) sectionButtons: TemplateRef<any>;

    toggleCollapsed() {
        this.isCollapsed = !this.isCollapsed;
        this.localStorageService.store(this.storageKey, this.isCollapsed);
    }

    hiddenConversations: ConversationDto[] = [];
    visibleConversations: ConversationDto[] = [];
    allConversations: ConversationDto[] = [];
    numberOfConversations = 0;

    getAsChannel = getAsChannelDto;
    getConversationName = this.conversationService.getConversationName;

    // icon imports
    faChevronRight = faChevronRight;
    faMessage = faMessage;

    constructor(public conversationService: ConversationService, public localStorageService: LocalStorageService) {}

    conversationsTrackByFn = (index: number, conversation: ConversationDto): number => conversation.id!;
    showHiddenConversations = false;

    ngOnInit(): void {
        this.isCollapsed = !!this.localStorageService.retrieve(this.storageKey);
        this.localStorageService.store(this.storageKey, this.isCollapsed);
    }

    get storageKey() {
        return this.prefix + this.headerKey;
    }
}
